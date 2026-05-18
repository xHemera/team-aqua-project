"use client";

import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Game()
{
    const router = useRouter();
    const [userPseudo, setUserPseudo] = useState("");
    const [opponent, setOpponent] = useState("");
    const [oppGaveUp, setOppGaveUp] = useState(false);
    const [oppSock, setOppSock] = useState("");

    //fetch the current user pseudo
    useEffect(() => {
      const getUserData = async () => {
        const { data } = await authClient.getSession();
        if (data && data.user.name)
          setUserPseudo(data.user.name);
        else
        {
          router.push("/not-connected");
          return ;
        }
        const res = await fetch(`api/user/opponent?pseudo=${data.user.name}`, {
          method: "GET",
        });
        if (!res.ok)
          router.push("/home");
        const opp = await res.json();
        setOpponent(opp.name);
        setOppSock(opp.socketId);
      };
      getUserData();
    }, []);

    useEffect(() => {
      if (socket.connected) return;
      router.push("/home");
    }, [userPseudo]);
  
    useEffect(() => {
      if (!userPseudo) return;
      socket.on("ban", (banned) => {
        if (banned === userPseudo)
          handleLogout();
      });
      socket.on("online_users", async (users) => {
        if (users[opponent] !== oppSock)
        {
          setOppGaveUp(true);
          router.push("/home");
        }
      });
    }, [userPseudo]);
    
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
        <div className="flex w-full justify-center px-4">PlaceHolder {opponent} {oppGaveUp ? "Gave up" : "Here"}</div>
    )
}