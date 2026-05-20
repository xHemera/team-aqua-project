"use client";

import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SpellSelector from "@/components/molecules/game/SpellSelector";

import { CHARACTERS } from "@/public/gameResources/heroes";

export default function Game()
{
    const archer = CHARACTERS.find((char) => char.identity.id === "archer");
    const assassin = CHARACTERS.find((char) => char.identity.id === "assassin");
    const healer = CHARACTERS.find((char) => char.identity.id === "healer");
    const knight = CHARACTERS.find((char) => char.identity.id === "knight");
    const mage = CHARACTERS.find((char) => char.identity.id === "mage");

    const router = useRouter();
    const [userPseudo, setUserPseudo] = useState("");
    const [teamSelected, setTeamSelected] = useState<Array<typeof CHARACTERS[number] | null> | null>(null);
    const [selectedHero, setSelectedHero] = useState<typeof CHARACTERS[number] | null>(null);
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
          // router.push("/home");
          return ;
        }
        const opp = await res.json();
        setOpponent(opp.name);
        setOppSock(opp.socketId);
      };
      getUserData();
    }, []);

    // Load selected team from Home (localStorage key: "home-team-slots")
    useEffect(() => {
      try {
        const raw = localStorage.getItem("home-team-slots");
        if (raw) {
          const ids = JSON.parse(raw) as Array<string | null>;
          if (Array.isArray(ids) && ids.length === 3) {
            const mapped = ids.map((id) => (id ? CHARACTERS.find((h) => h.identity.id === id) ?? null : null));
            setTeamSelected(mapped);
            return;
          }
        }
      } catch (e) {
        // ignore malformed
      }
      // fallback: first three characters
      setTeamSelected(CHARACTERS.slice(0, 3).map((c) => c ?? null));
    }, []);

      // Initialize selected hero when team loads
      useEffect(() => {
        if (teamSelected && teamSelected[0]) {
          setSelectedHero(teamSelected[0]);
        }
      }, [teamSelected]);

    useEffect(() => {
      if (socket.connected) return;
      // router.push("/home");
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
        // router.push("/");
    };

    if (!teamSelected) {
      return (
        <div className="flex w-full justify-center px-4">
          <div className="rounded border border-[#3c3650] bg-[#0f0e13] p-4 text-[#cfc8e6]">Chargement...</div>
        </div>
      );
    }

    const firstHero = teamSelected[0] ?? CHARACTERS.find(h => h.identity.id === "archer");
    if (!firstHero) {
      return (
        <div className="flex w-full justify-center px-4">
          <div className="rounded border border-red-600 bg-[#0f0e13] p-4 text-red-200">Héros introuvable</div>
        </div>
      );
    }

    return (
        <div className="flex w-full justify-center px-4">
          <div className="mb-4 flex gap-2">
            {teamSelected.map((h, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => h && setSelectedHero(h)}
                disabled={!h}
                className={
                  `rounded px-3 py-1 text-sm font-medium ${h ? (selectedHero?.identity.id === h.identity.id ? "border border-[#8b7fff] bg-[#2b2740]" : "border border-[#3c3650] bg-[#0f0e13]") : "border border-dashed border-gray-700 bg-[#0f0e13] text-gray-500"}`
                }
              >
                {h ? h.identity.name : "Vide"}
              </button>
            ))}
          </div>
          <SpellSelector hero={selectedHero ?? firstHero} />
        </div>
    )
}