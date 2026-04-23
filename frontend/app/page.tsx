"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { socket } from "../socket"
import AuthPageLayout from "@/components/AuthPageLayout";
import Button from "@/components/atoms/Button";
import IconField from "@/components/molecules/IconField";

type User = {
  id:            			string;
  name:          			string;
  badges:             string[];
  blockedUsers:       string[];
};

// Page d'entrée: connexion + création de compte (mode toggle)
export default function LoginPage() {
  // États de formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [pseudo, setPseudo] = useState<string | null>(null);
  const router = useRouter();


  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("/api/users", {
        method: "GET"
      })
      const data: unknown = await response.json();
      if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "error" in data
          ? String((data as { error?: string }).error ?? "Impossible de charger les utilisateurs")
          : "Impossible de charger les utilisateurs";
        throw new Error(errorMessage);
      }
      const users = data as User[];
      if (users.length === 0)
      {
          try {
            await authClient.signUp.email({
              name: "Xoco",
              email: "Xoco@gmail.com",
              password: "12345678",
            });
            await authClient.signUp.email({
              name: "Hemera",
              email: "hemera@gmail.com",
              password: "12345678",
            });
        }

        catch {
          setMessage("Registration error");
          return;
        }
        setIsRegisterMode(false);
        setPassword("");
        setName("");
        await fetch("/api/users", {
          method: "POST",
        })
      }
    }
    fetchUsers();
  }, [])

  //Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.session) {
          router.push("/home");
        }
      } catch {
        // Pas de session, on reste sur la page de login
      }
    };
    checkSession();
  }, [router]);

  //permet d'envoyer l'utilisateur a redis dans le serveur
  useEffect(() => {
    if (!pseudo) return;

    socket.connect();
    socket.emit("login", pseudo);

    const onOnlineUsers = (users: unknown) => {
      console.log("Users from Redis:", users);
    };

    socket.on("online_users", onOnlineUsers);

    return () => {
      socket.off("online_users", onOnlineUsers);
    };
  }, [pseudo]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    if (isRegisterMode) {
      // Inscription d'un nouvel utilisateur
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (error) {
        setMessage(error.message ?? "Registration error");
      } else {
        socket.emit("creation");
        setMessage("Account created successfully! You can now sign in.");
        setIsRegisterMode(false);
        setPassword("");
        setName("");
      }
    } else {
      // Connexion d'un utilisateur existant
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setMessage(error.message ?? "Sign-in error");
      }
      else {
        setMessage("Signed in successfully!");
        setPseudo(data.user.name || "user");
        const response = await fetch("/api/user", {
          method: "PUT"
        })
        const user: unknown = await response.json();
        if (!response.ok) {
        const errorMessage =
          typeof user === "object" && user !== null && "error" in user
            ? String((user as { error: string }).error ?? "Impossible de charger l'utilisateur")
            : "Impossible de charger l'utilisateur";
          throw new Error(errorMessage);
        }
        setTimeout(() => router.push(`/profile/${data.user.name}`), 500);
      }
    }
    setLoading(false);
  };

  return (
    <AuthPageLayout>
      <div className="w-full">
        <form onSubmit={onSubmit} className="space-y-4">
          {isRegisterMode && (
            <>
              {/* Usage molecule/atom: IconField reutilise Input pour garder un style homogene. */}
              <IconField
                iconClassName="fa-regular fa-id-card"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
              />
            </>
          )}

          <IconField
            iconClassName="fa-regular fa-user"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <IconField
            iconClassName="fa-solid fa-lock"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={8}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Usage atomique: Button remplace les boutons inline pour reutilisation maximale. */}
            <Button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setMessage("");
              }}
              variant="secondary"
            >
              {isRegisterMode ? "Sign in" : "Sign up"}
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? "..." : isRegisterMode ? "Create account" : "Sign in"}
            </Button>
          </div>
          {message && (
            <p
              className={`text-center text-sm ${
                message.includes("success") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </AuthPageLayout>
  );
}
