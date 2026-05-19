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
        {
          router.push("/home");
          return ;
        }
        const opp = await res.json();
        setOpponent(opp.name);
        setOppSock(opp.socketId);
      };
      getUserData();
    }, []);

    useEffect(() => {
      if (socket.connected) return;
      router.push("/home");
      return ;
    }, []);
  
    useEffect(() => {
      if (!userPseudo) return;
      const handleBan = (banned: string) => {
        if (banned === userPseudo)
          handleLogout();
      };
      const handleDisconnect = (users: {[x: string]: string;}) => {
        if (users[opponent] !== oppSock)
        {
          setOppGaveUp(true);
          socket.off("ban", handleBan);
          socket.off("online_users", handleDisconnect);
          router.push("/home");
        }
      };

      socket.removeAllListeners("online_users");
      socket.on("ban", handleBan);
      socket.once("online_users", handleDisconnect);

      return () => {
        socket.off("ban", handleBan);
        socket.off("online_users", handleDisconnect);
      };
    }, [userPseudo, opponent, oppSock]);
    
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