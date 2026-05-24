"use client";

import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Team } from "./spells";
import { spells } from "./index";
import SpellSelector from "@/components/molecules/game/SpellSelector";
import ProfileInfo from "@/components/atoms/game/ProfileInfo";
import ManaBar from "@/components/atoms/game/ManaBar";
import Fighter from "@/components/atoms/game/Fighter";
import EnemyFighter from "@/components/atoms/game/EnemyFighter";
import TurnQueue from "@/components/atoms/game/TurnQueue";
import InfoModal from "@/components/atoms/game/InfoModal";
import type { CharacterData } from "@/components/organisms/characters/types";

import { CHARACTERS } from "@/public/gameResources/heroes";

export default function Game() {
  const router = useRouter();
  const [userPseudo, setUserPseudo] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [oppAvatar, setOppAvatar] = useState<string | null>(null);
  const [playerCharacters, setPlayerCharacters] = useState<
    CharacterData[] | null
  >(null);
  const [teamSelected, setTeamSelected] = useState<Array<
    (typeof CHARACTERS)[number] | null
  > | null>(null);
  const [selectedHero, setSelectedHero] = useState<
    (typeof CHARACTERS)[number] | null
  >(null);
  const [opponent, setOpponent] = useState("");
  const [team, setTeam] = useState<string[] | null>([]);
  const [oppTeam, setOppTeam] = useState<string[] | null>([]);
  const [oppGaveUp, setOppGaveUp] = useState(false);
  const [oppSock, setOppSock] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(true);
  const [roomId, setRoomId] = useState(0);

  //fetch the current user pseudo
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data && data.user.name) setUserPseudo(data.user.name);
      else {
        // router.push("/not-connected");
        return;
      }
      const [cres, ores] = await Promise.all([
        fetch(`/api/user?pseudo=${data.user.name}`, {
          method: "GET",
        }),
        fetch(`/api/user/opponent?pseudo=${data.user.name}`, {
          method: "GET",
        }),
      ]);
      if (!ores.ok) {
        // router.push("/home");
        return;
      }
      const res = await cres.json();
      const team: Team = {
        owner: data.user.name,
        characters: res.team,
        levels: res.levels,
        skillsLevels: res.spellsLevels,
      };
      setTeam(res.team);
      const opp = await ores.json();
      spells.initialData(team, opp.roomId);
      setOpponent(opp.name);
      setOppTeam(opp.team);
      setOppAvatar(opp.avatar);
      setRoomId(opp.roomId);
    };
    getUserData();

    const loadProfileAvatar = async () => {
      const profileResponse = await fetch("/api/profile/", {
        method: "GET",
        cache: "no-store",
      });
      if (!profileResponse.ok) {
        return;
      }

      const profile = (await profileResponse.json()) as {
        image: string | null;
        avatar: { url: string | null } | null;
      };
      setUserAvatar(profile.image ?? profile.avatar?.url ?? null);
    };

    void loadProfileAvatar();
  }, []);

  useEffect(() => {
    if (!userPseudo) return;

    const loadPlayerCharacters = async () => {
      const response = await fetch(
        `/api/characters?username=${encodeURIComponent(userPseudo)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as {
        characters: CharacterData[];
      };

      setPlayerCharacters(payload.characters);
    };

    void loadPlayerCharacters();
  }, [userPseudo]);

  // Load selected team from Home (localStorage key: "home-team-slots")
  useEffect(() => {
    try {
      if (team && team.length === 3) {
        const mapped = team.map((id) =>
          id ? (CHARACTERS.find((h) => h.identity.name === id) ?? null) : null,
        );
        setTeamSelected(mapped);
        return;
      }
    } catch (e) {
      // ignore malformed
    }
    // fallback: first three characters
    setTeamSelected(CHARACTERS.slice(0, 3).map((c) => c ?? null));
  }, [team]);

  // Initialize selected hero when team loads
  useEffect(() => {
    if (teamSelected && teamSelected[0]) {
      setSelectedHero(teamSelected[0]);
    }
  }, [teamSelected]);

  useEffect(() => {
    //connect the socket
    if (!userPseudo) return;

    if (!socket.connected) {
      socket.connect();
    }

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
    const handleBan = (banned: string) => {
      if (banned === userPseudo) handleLogout();
    };
    const handleDisconnect = (users: { [x: string]: string }) => {
      if (!users[opponent]) {
        setTimeout(() => {
          socket.once("online_users", (users) => {
            if (users[opponent]) return;
            else {
              socket.off("ban", handleBan);
              socket.off("online_users", handleDisconnect);
              router.push("/home");
            }
          });
        }, 3000);
      }
    };

    socket.removeAllListeners("online_users");
    socket.on("ban", handleBan);
    socket.once("online_users", handleDisconnect);

    return () => {
      socket.off("ban", handleBan);
      socket.off("online_users", handleDisconnect);
    };
  }, [userPseudo, opponent]);

  const handleLogout = async () => {
    const response = await fetch("/api/profile", {
      method: "PUT",
    });
    const user: unknown = await response.json();
    if (!response.ok) {
      const errorMessage =
        typeof user === "object" && user !== null && "error" in user
          ? String(
              (user as { error: string }).error ??
                "Impossible de charger l'utilisateur",
            )
          : "Impossible de charger l'utilisateur";
      throw new Error(errorMessage);
    }
    socket.emit("isdisconnecting");
    socket.disconnect();
    await authClient.signOut();
    router.push("/");
  };

  if (!teamSelected || !oppTeam) {
    return (
      <div className="flex w-full justify-center px-4">
        <div className="rounded border border-[#3c3650] bg-[#0f0e13] p-4 text-[#cfc8e6]">
          Chargement...
        </div>
      </div>
    );
  }

  const firstHero =
    teamSelected[0] ?? CHARACTERS.find((h) => h.identity.id === "archer");
  if (!firstHero) {
    return (
      <div className="flex w-full justify-center px-4">
        <div className="rounded border border-red-600 bg-[#0f0e13] p-4 text-red-200">
          Héros introuvable
        </div>
      </div>
    );
  }

  const enemyTeam = oppTeam
    .map((id) => CHARACTERS.find((h) => h.identity.name === id) ?? null)
    .filter((character): character is (typeof CHARACTERS)[number] =>
      Boolean(character),
    );

  const selectedHeroCard = selectedHero ?? firstHero;
  const selectedCharacter =
    playerCharacters?.find(
      (character) => character.name === selectedHeroCard.identity.name,
    ) ?? null;

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden px-4 py-4 text-[16px] leading-7 text-[#f5e6c8]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#0a0806]" />
      <div className="pointer-events-none fixed inset-0 -z-10 animate-aurora bg-[radial-gradient(ellipse_at_50%_30%,#1a1420_0%,#0a0806_60%)]" />

      {/* animated gradient sweep */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.04]">
        <div className="absolute inset-0 animate-sweep"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #c9b896 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* ground platform */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 -z-10 h-[45vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a06] via-[#1a1410] to-transparent" />
      </div>

      {/* vs divider glow */}
      <div className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-px w-[30vw] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#c9a84c]/8 to-transparent" />

      <TurnQueue />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl -translate-y-20 rounded-3xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {enemyTeam.map((character) => (
                <div key={character.identity.id} className="w-full opacity-90">
                  <EnemyFighter character={character} />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {teamSelected.map((character, index) => (
                <div key={character?.identity.id ?? `own-slot-${index}`}>
                  {character ? (
                    <Fighter
                      character={character}
                      active={
                        selectedHero?.identity.id === character.identity.id
                      }
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-[#0f0e13] text-sm text-gray-500">
                      Vide
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-start justify-end gap-4">
          <ProfileInfo
            account={{ pseudo: opponent, profilePhoto: oppAvatar }}
          />
        </div>
        <p className="text-xs text-[#8b82a6]">
          Session ID: {roomId > 0 ? roomId : "NaN"}
        </p>
      </div>

      <div className="mt-auto" />

      <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(11rem,15rem)] gap-3 sm:gap-4 md:grid-cols-[minmax(0,7fr)_minmax(240px,280px)] md:items-stretch">
        <div className="min-w-0 flex items-end">
          <SpellSelector
            hero={selectedHeroCard}
            character={selectedCharacter}
            className="w-full"
          />
        </div>

        <div className="flex flex-col items-end gap-3 md:h-full md:justify-between">
          <div className="flex flex-col items-end gap-3">
            <ManaBar currentMana={42} />
          </div>

          <button
            type="button"
            onClick={() => router.push("/home")}
            className="group relative w-full overflow-hidden rounded-md border-2 border-[#2a1f14] bg-gradient-to-b from-[#14100a] to-[#0f0a06] px-4 py-2 font-serif text-sm font-semibold tracking-wide text-[#c9b896] transition-all duration-150 hover:border-[#c9a84c] hover:text-[#e8dcc8] hover:shadow-[0_0_14px_rgba(201,168,76,0.12)] md:w-auto"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-t from-[#c9a84c]/5 to-transparent" />
            </div>
            <span className="relative z-10">Forfeit</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsYourTurn((currentTurn) => !currentTurn);
              setIsInfoModalOpen(true);
            }}
            className="group relative w-full overflow-hidden rounded-md border-2 border-[#2a1f14] bg-gradient-to-b from-[#14100a] to-[#0f0a06] px-4 py-2 font-serif text-sm font-semibold tracking-wide text-[#c9b896] transition-all duration-150 hover:border-[#c9a84c] hover:text-[#e8dcc8] hover:shadow-[0_0_14px_rgba(201,168,76,0.12)] md:w-auto"
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <div className="absolute inset-0 bg-gradient-to-t from-[#c9a84c]/5 to-transparent" />
            </div>
            <span className="relative z-10">Test</span>
          </button>
          <ProfileInfo
            account={{ pseudo: userPseudo, profilePhoto: userAvatar }}
            className="self-end"
          />
        </div>
      </div>

      <InfoModal
        open={isInfoModalOpen}
        isYourTurn={isYourTurn}
        onClose={() => setIsInfoModalOpen(false)}
      />

      <style jsx>{`
        @keyframes aurora {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes sweep {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-aurora { animation: aurora 8s ease-in-out infinite; }
        .animate-sweep { animation: sweep 12s linear infinite; }
      `}</style>
    </div>
  );
}
