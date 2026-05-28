"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";

export async function handleLogout(router: AppRouterInstance) {
  const response = await fetch("/api/profile", { method: "PUT" });
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
}
