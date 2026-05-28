"use client";

import { useState, useEffect, useCallback } from "react";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { handleLogout } from "@/lib/logout";
import { emitGlobalError } from "@/lib/error-events";
import type { GameStatePayload } from "./types";

type UseGameSocketReturn = {
  gameState: GameStatePayload | null;
  playerId: number | null;
  socketConnected: boolean;
};

export function useGameSocket(
  userPseudo: string,
  opponent: string,
): UseGameSocketReturn {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameStatePayload | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [socketConnected, setSocketConnected] = useState(socket.connected);

  // Connect socket and listen for game state updates
  useEffect(() => {
    console.log("[GameSocket] mount — socket.connected:", socket.connected, "socket.id:", socket.id);
    if (!socket.connected) {
      console.log("[GameSocket] connecting...");
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("[GameSocket] connected — id:", socket.id);
      setSocketConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("[GameSocket] disconnected — reason:", reason);
      setSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("[GameSocket] connect_error:", err.message);
    });

    socket.on("gameStateUpdate", (state: GameStatePayload) => {
      console.log("[GameSocket] gameStateUpdate received — turn:", state.turn, "phase:", state.gamePhase, "playerId:", state.playerId);
      setPlayerId(state.playerId);
      setGameState(state);
    });

    return () => {
      console.log("[GameSocket] cleanup — removing listeners");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("gameStateUpdate");
    };
  }, []);

  // Emit login when pseudo is available
  useEffect(() => {
    if (!userPseudo) return;
    socket.emit("login", userPseudo);
  }, [userPseudo]);

  // Ban and disconnect listeners
  useEffect(() => {
    if (!userPseudo) return;

    const handleBan = async (banned: string) => {
      if (banned === userPseudo) {
        try {
          await handleLogout(router);
        } catch {
          emitGlobalError("Vous avez été banni");
          router.push("/");
        }
      }
    };

    const handleDisconnect = (users: Record<string, string>) => {
      if (!users[opponent]) {
        setTimeout(() => {
          socket.once("online_users", (users) => {
            if (users[opponent]) return;
            socket.off("ban", handleBan);
            socket.off("online_users", handleDisconnect);
            router.push("/home");
          });
        }, 3000);
      }
    };

    socket.off("online_users", handleDisconnect);
    socket.on("ban", handleBan);
    socket.once("online_users", handleDisconnect);

    return () => {
      socket.off("ban", handleBan);
      socket.off("online_users", handleDisconnect);
    };
  }, [userPseudo, opponent, router]);

  return { gameState, playerId, socketConnected };
}
