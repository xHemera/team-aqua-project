"use client";

import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Game()
{
    const router = useRouter();
    const [userPseudo, setUserPseudo] = useState("");
    //fetch the current user pseudo
      useEffect(() => {
        const getUserData = async () => {
          const { data } = await authClient.getSession();
          if (data && data.user.name)
            setUserPseudo(data.user.name);
          else
            router.push("/not-connected");
        };
        getUserData();
      }, []);

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
    return (
        <div className="flex w-full justify-center px-4">PlaceHolder</div>
    )
}