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
import Button from "@/components/atoms/Button";

export default function Game()
{
  const router = useRouter();
  const [userPseudo, setUserPseudo] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [oppAvatar, setOppAvatar] = useState<string | null>(null);
  const [playerCharacters, setPlayerCharacters] = useState<CharacterData[] | null>(null);
  const [teamSelected, setTeamSelected] = useState<Array<typeof CHARACTERS[number] | null> | null>(null);
  const [selectedHero, setSelectedHero] = useState<typeof CHARACTERS[number] | null>(null);
  const [opponent, setOpponent] = useState("");
  const [team, setTeam] = useState<string[] | null>([]);
  const [oppTeam, setOppTeam] = useState<string[] | null>([]);
  const [oppGaveUp, setOppGaveUp] = useState(false);
  const [oppSock, setOppSock] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isYourTurn, setIsYourTurn] = useState(true);


  //fetch the current user pseudo
  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data && data.user.name)
        setUserPseudo(data.user.name);
      else
      {
        // router.push("/not-connected");
        return ;
      }
      const [cres, ores] = await Promise.all([
        fetch (`/api/user?pseudo=${data.user.name}`, {
          method: "GET",
        }),
        fetch(`api/user/opponent?pseudo=${data.user.name}`, {
          method: "GET",
        }),
      ])
      if (!ores.ok)
      {
        // router.push("/home");
        return ;
      }
      const res = await cres.json();
      const team: Team = {
        owner: data.user.name,
        characters: res.team,
        levels: res.levels,
        skillsLevels: res.spellsLevels,
      }
      setTeam(res.team);
      spells.initialData(team);
      const opp = await ores.json();
      setOpponent(opp.name);
      setOppTeam(opp.team);
      setOppAvatar(opp.avatar);
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

      const profile = await profileResponse.json() as {
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
      const response = await fetch(`/api/characters?username=${encodeURIComponent(userPseudo)}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const payload = await response.json() as {
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
        const mapped = team.map((id) => (id ? CHARACTERS.find((h) => h.identity.name === id) ?? null : null));
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
    const handleBan = (banned: string) => {
      if (banned === userPseudo)
        handleLogout();
    };
    const handleDisconnect = (users: {[x: string]: string;}) => {
      if (!users[opponent])
      {
        setTimeout(() => {
          socket.once("online_users", (users) => {
            if (users[opponent])
              return ;
            else
            {
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

  const enemyTeam = [
    CHARACTERS.find((character) => character.identity.id === "knight") ?? null,
    CHARACTERS.find((character) => character.identity.id === "mage") ?? null,
  ].filter((character): character is (typeof CHARACTERS)[number] => Boolean(character));

  const selectedHeroCard = selectedHero ?? firstHero;
  const selectedCharacter = playerCharacters?.find((character) => character.name === selectedHeroCard.identity.name) ?? null;

  return (
      <div className="game-screen relative flex min-h-screen w-full flex-col px-4 py-4 text-[16px] leading-7 text-[#f5e6c8]" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <TurnQueue />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-4xl -translate-y-20 rounded-3xl">
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="grid w-2/3 grid-cols-2 justify-items-center gap-2 sm:gap-3">
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
                      <Fighter character={character} active={selectedHero?.identity.id === character.identity.id} />
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

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1" />
          <ProfileInfo account={{ pseudo: opponent }} className="ml-auto" />
        </div>

        <div className="flex-1" />

        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)] lg:items-stretch">
          <div className="min-w-0 lg:flex lg:items-end">
            <SpellSelector hero={selectedHeroCard} character={selectedCharacter} className="w-full" />
          </div>

          <div className="flex flex-col gap-3 lg:h-full lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3 lg:items-end">
              <ManaBar currentMana={42} />
            </div>

            <Button variant="secondary" onClick={() => router.push("/home")} className="w-full lg:w-auto">
              Forfeit
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setIsYourTurn((currentTurn) => !currentTurn);
                setIsInfoModalOpen(true);
              }}
              className="w-full lg:w-auto"
            >
              Test
            </Button>
            <ProfileInfo account={{ pseudo: userPseudo, profilePhoto: userAvatar }} />
          </div>
        </div>

        <InfoModal
          open={isInfoModalOpen}
          isYourTurn={isYourTurn}
          onClose={() => setIsInfoModalOpen(false)}
        />
      </div>
  )
}