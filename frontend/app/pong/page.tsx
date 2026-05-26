"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";

export default function PongPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userPseudo, setUserPseudo] = useState("");
  // board
  const boardWidth = 1500;
  const boardHeight = 900;
  const router = useRouter();
  const [winner, setWinner] = useState<null | "left" | "right">(null);
  const [isCollectingXp, setIsCollectingXp] = useState(false);
  const [xpCollected, setXpCollected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const xp = useRef(0);
  const angle = (Math.random() * Math.PI / 3) - Math.PI / 6;
  const [opponent, setOpponent] = useState("");

  // Joueurs 1 ref
  const player1 = useRef({
    x: 20,
    y: boardHeight / 2 - 50,
    width: 10,
    height: 100,
    speed: 6,
  });

  // Joueur 2 ref
  const player2 = useRef({
    x: boardWidth - 30,
    y: boardHeight / 2 - 50,
    width: 10,
    height: 100,
    speed: 6,
  });

  // Balle
  const ball = useRef({
    x: boardWidth / 2,
    y: boardHeight / 2,
    radius: 10,
    speedX: 2,
    speedY: 2,
    started: false,
  });

  // Touches
  const keys = useRef<{ [key: string]: boolean }>({});

   useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data && data.user.name)
        setUserPseudo(data.user.name);
      else
      {
        router.push("/not-connected");
        return;
      }

      const res = await fetch(`/api/pong?pseudo=${data.user.name}`, { method: "GET" });
      const odata = await res.json();
      setOpponent(odata.name);
    };
    getUserData();
  }, []);

  //connect the socket
  useEffect(() => {
    if (socket.connected) return;
    socket.connect();
		socket.emit("login", userPseudo);

		socket.on("online_users", (users) => {
			console.log("Users from Redis:", users);
		});

		return () => {
			socket.off("online_users");
		};
  }, [userPseudo]);

  useEffect(() => {
    if (!userPseudo) return;
    socket.on("ban", (banned) => {
      if (banned === userPseudo)
        handleLogout();
    });
    socket.on("pong", (data) => {
      player2.current.y = data.y;
    });
  }, [userPseudo])

  const handleLogout = async () => {
    const response = await fetch("/api/profile", {
        method: "PUT",
      })
      const user: unknown = await response.json();
      if (!response.ok) {
        const errorMessage =
        typeof user === "object" && user !== null && "error" in user
          ? String((user as { error: string }).error ?? "Impossible de charger l'utilisateur")
          : "Impossible de charger l'utilisateur";
        throw new Error(errorMessage);
      }
    socket.emit("isdisconnecting");
    socket.disconnect();
    await authClient.signOut();
    router.push("/");
  };

  // Charger le username
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data && data.user.name) {
        setUserPseudo(data.user.name);
      }
    };

    const timeoutId = window.setTimeout(() => {
      void getUserData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  // Fonction pour récolter l'XP
  const handleCollectXp = async () => {
    if (!userPseudo || xp.current === 0) return;

    setIsCollectingXp(true);
    try {
      const response = await fetch("/api/characters/reward-xp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: userPseudo, xpGained: xp.current }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de la récolte d'XP");
        setIsCollectingXp(false);
        return;
      }

      setXpCollected(true);
      setIsCollectingXp(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setIsCollectingXp(false);
    }
  };

  //context du jeu
  useEffect(() => {
    const board = canvasRef.current;

    if (!board)
      return;
    const context = board.getContext("2d");
    if (!context)
      return;

    // Clavier
    const keyDown = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = true;
    };

    const keyUp = (e: KeyboardEvent) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    // Boucle du jeu
    const update = () => {
      const p1 = player1.current;
      const p2 = player2.current;
      const b = ball.current;

      if (winner)
        return;

      // Mouvement joueur 1
      if (keys.current["w"] && p1.y > 0) {
        p1.y -= p1.speed;
        socket.emit("pong_info", {
          opponent,
          y: p1.y,
        });
      }

      if (keys.current["s"] && p1.y + p1.height < boardHeight) {
        p1.y += p1.speed;
        socket.emit("pong_info", {
          opponent,
          y: p1.y,
        });
      }

      // Mouvement joueur 2
      if (keys.current["arrowup"] && p2.y > 0) {
        p2.y -= p2.speed;
      }
      if (keys.current["arrowdown"] && p2.y + p2.height < boardHeight) {
        p2.y += p2.speed;
      }


      // Lancer la balle avec espace
      if (keys.current[" "] && !b.started) {
        b.started = true;
      }

      // Mouvement balle
      if (b.started) {
        b.x += b.speedX;
        b.y += b.speedY;
      }

      // Collision haut/bas
      if (b.y - b.radius <= 0 || b.y + b.radius >= boardHeight) {
        b.speedY *= -1;
      }

      const paddleCollision = (b: any, p: any, isLeft: boolean) => {
        const nextX = b.x + b.speedX;

        const withinY =
          b.y + b.radius > p.y &&
          b.y - b.radius < p.y + p.height;

        const hitX = isLeft
          ? nextX - b.radius <= p.x + p.width && b.x > p.x
          : nextX + b.radius >= p.x && b.x < p.x + p.width;

        if (withinY && hitX) {
          // reposition anti-bug
          if (isLeft) {
            b.x = p.x + p.width + b.radius;
          } else {
            b.x = p.x - b.radius;
          }

          // inversion direction
          b.speedX *= -1;

        // multiplicateur accélération
        const accel = 1.08;

        b.speedX *= accel;
        b.speedY *= accel;

        // XP random entre 0 et 2
        const gainedXp = Math.floor(Math.random() * 3);
        xp.current += gainedXp;

        // limite vitesse
        const maxSpeed = 18;

        b.speedX = Math.max(Math.min(b.speedX, maxSpeed), -maxSpeed);
        b.speedY = Math.max(Math.min(b.speedY, maxSpeed), -maxSpeed);
        }
      };

      // Sortie gauche -> joueur droit gagne
      if (b.x < 0) {
        setWinner("right");
        b.started = false;
      }

      // Sortie droite -> joueur gauche gagne
      if (b.x > boardWidth) {
        setWinner("left");
        b.started = false;
      }

      // Nettoyage
      context.clearRect(0, 0, boardWidth, boardHeight);

      // Fond
      context.fillStyle = "black";
      context.fillRect(0, 0, boardWidth, boardHeight);

      // Ligne centrale
      context.strokeStyle = "white";
      context.setLineDash([10, 10]);
      context.beginPath();
      context.moveTo(boardWidth / 2, 0);
      context.lineTo(boardWidth / 2, boardHeight);
      context.stroke();
      
      // Joueur 1
      context.fillStyle = "gray";
      context.fillRect(
        p1.x,
        p1.y,
        p1.width,
        p1.height
      );

      // Joueur 2
      context.fillStyle = "gray";
      context.fillRect(
        p2.x,
        p2.y,
        p2.width,
        p2.height
      );

      // Dessin de la balle
      context.beginPath();

      context.arc(
        b.x,
        b.y,
        b.radius,
        0,
        Math.PI * 2
      );

      context.fillStyle = "white";
      context.fill();
      context.fillStyle = "white";
      context.font = "30px Arial";
      context.fillText(`XP: ${xp.current}`, boardWidth - 150, 50);

      paddleCollision(b, p1, true);
      paddleCollision(b, p2, false);
      requestAnimationFrame(update);

    };

    update();

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

return (
  <div className="min-h-screen bg-black flex items-center justify-center relative">
    <>{opponent}</>
    <canvas
      ref={canvasRef}
      width={boardWidth}
      height={boardHeight}
      className="border-4 border-white"
    />

    {/* MODAL WIN */}
    {winner && (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
        <div className="bg-white text-black p-8 rounded-xl text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Vous avez gagné {xp.current} XP pour chaque personnage !
          </h2>

          {error && (
            <p className="text-red-600 font-semibold">{error}</p>
          )}

          {!xpCollected ? (
            <button
              className="px-6 py-2 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCollectXp}
              disabled={isCollectingXp || !userPseudo}
            >
              {isCollectingXp ? "Récolte en cours..." : "Récolter l'XP"}
            </button>
          ) : (
            <>
              <p className="text-green-600 font-semibold">✓ XP récolté avec succès !</p>
              <button
                className="px-6 py-2 bg-black text-white rounded"
                onClick={() => router.push("home")}
              >
                Retour à l'accueil
              </button>
            </>
          )}
        </div>
      </div>
    )}
  </div>
);
}