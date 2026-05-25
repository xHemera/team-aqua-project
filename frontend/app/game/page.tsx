"use client";

import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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

type PlayerState = {
  id: number;
  characters: CharacterState[];
};

type CharacterState = {
  uid: string;
  currentHp: number;
  currentMp: number;
  maxHp: number;
  maxMp: number;
  owner: number;
  stunned: number;
  invisible: number;
  shieldHp: number;
  overHp: number;
  invul: number;
  taunted: number;
  poison: { value: number; turn: number }[];
  lastStandUsable: boolean;
  lastStandUsed: boolean;
};

type TurnQueueEntry = {
  characterUid: string;
  playerOwner: number;
  charge: number;
};

type GameStatePayload = {
  turn: number;
  gamePhase: string;
  winnerId: number | null;
  activePlayerOwner: number;
  playerId: number;
  turnQueue: TurnQueueEntry[];
  players: PlayerState[];
};

function getPlayerChars(
  players: PlayerState[],
  playerIdx: number,
): CharacterState[] {
  return players[playerIdx]?.characters ?? [];
}

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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [roomId, setRoomId] = useState(0);

  const [playerId, setPlayerId] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameStatePayload | null>(null);
  const prevTurnRef = useRef(0);
  const hasShownStartModal = useRef(false);

  const isYourTurn =
    playerId !== null && gameState !== null
      ? gameState.activePlayerOwner === playerId
      : false;
  const myCharacters = playerId !== null && gameState
    ? getPlayerChars(gameState.players, playerId)
    : [];
  const oppCharacters = playerId !== null && gameState
    ? getPlayerChars(gameState.players, 1 - playerId)
    : [];
  const activeCharacterUid =
    gameState?.turnQueue[0]?.characterUid ?? null;

  // Connect socket and attach listeners eagerly, then fetch user data
  useEffect(() => {
    if (!socket.connected) {
      console.log("[GameClient] Socket not connected, connecting...");
      socket.connect();
    } else {
      console.log("[GameClient] Socket already connected, id:", socket.id);
    }

    socket.on("gameStateUpdate", (state: GameStatePayload) => {
      console.log(
        `[GameClient] gameStateUpdate — turn=${state.turn} phase=${state.gamePhase} activePlayer=${state.activePlayerOwner} myPlayerId=${state.playerId} isYourTurn=${state.activePlayerOwner === state.playerId}`
      );
      setPlayerId(state.playerId);
      setGameState(state);
    });

    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data && data.user.name) setUserPseudo(data.user.name);
      else return;
      const [cres, ores] = await Promise.all([
        fetch(`/api/user?pseudo=${data.user.name}`, {
          method: "GET",
        }),
        fetch(`/api/user/opponent?pseudo=${data.user.name}`, {
          method: "GET",
        }),
      ]);
      if (!ores.ok) return;
      const res = await cres.json();
      const team: Team = {
        owner: data.user.name,
        characters: res.team,
        levels: res.levels,
        skillsLevels: res.spellsLevels,
      };
      setTeam(res.team);
      const opp = await ores.json();
      console.log(`[GameClient] Sending initiate — room=${opp.roomId} team=${team.characters} opponent=${opp.name}`);
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

    return () => {
      socket.off("gameStateUpdate");
    };
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

  // Auto-select the active character and initialize selected hero
  useEffect(() => {
    if (teamSelected && teamSelected[0] && !gameState) {
      setSelectedHero(teamSelected[0]);
    }
  }, [teamSelected, gameState]);

  useEffect(() => {
    if (!gameState || !activeCharacterUid) return;
    const heroId = activeCharacterUid.split("_").at(-2);
    if (!heroId) return;
    const hero = CHARACTERS.find((h) => h.identity.id === heroId);
    if (hero) {
      console.log(`[GameClient] Active character changed to ${hero.identity.name} (turn=${gameState.turn})`);
      setSelectedHero(hero);
    }
  }, [gameState?.turn]);

  useEffect(() => {
    if (!userPseudo) return;

    socket.emit("login", userPseudo);
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

  // Show InfoModal when game starts or turn changes
  useEffect(() => {
    if (!gameState || playerId === null) return;

    if (!hasShownStartModal.current) {
      hasShownStartModal.current = true;
      prevTurnRef.current = gameState.turn;
      console.log(`[GameClient] Game started — turn=${gameState.turn} activePlayer=${gameState.activePlayerOwner}`);
      setIsInfoModalOpen(true);
      return;
    }

    if (gameState.turn !== prevTurnRef.current) {
      prevTurnRef.current = gameState.turn;
      console.log(`[GameClient] Turn changed — turn=${gameState.turn} activePlayer=${gameState.activePlayerOwner}`);
      setIsInfoModalOpen(true);
    }
  }, [gameState, playerId]);

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

  // Find a character by hero ID within a list
  const findCharByHeroId = (chars: CharacterState[], heroId: string) =>
    chars.find(c => c.uid.split("_").at(-2) === heroId);

  // Compute active character's current mana for the ManaBar
  const activeMp =
    gameState && activeCharacterUid
      ? [...myCharacters, ...oppCharacters].find(c => c.uid === activeCharacterUid)?.currentMp ?? 0
      : 0;

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden px-4 py-4 text-[16px] leading-7 text-[#f5e6c8]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[#0a0806]" />
      <div className="pointer-events-none fixed inset-0 -z-10 animate-aurora bg-[radial-gradient(ellipse_at_50%_30%,#1a1420_0%,#0a0806_60%)]" />

      {/* animated gradient sweep */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06]">
        <div className="absolute inset-0 animate-sweep"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #c9b896 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* stars */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[20%] top-[12%] h-px w-px animate-star rounded-full bg-[#c9b896]/40" />
        <div className="absolute right-[25%] top-[8%] h-px w-px animate-star-delayed rounded-full bg-[#c9b896]/30" />
      </div>

      {/* ground platform */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 -z-10 h-[45vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a06] via-[#1a1410] to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent, transparent 48px, #c9a84c 48px, #c9a84c 49px),
              repeating-linear-gradient(0deg, transparent, transparent 48px, #c9a84c 48px, #c9a84c 49px)
            `
          }}
        />
        <div className="absolute left-1/2 top-0 h-[20vh] w-[60vw] -translate-x-1/2 bg-[radial-gradient(ellipse_at_bottom,#c9a84c_0%,transparent_70%)] opacity-[0.04]" />
      </div>

      {/* floating particles */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px w-px animate-dust rounded-full bg-[#c9a84c]/15"
            style={{
              left: `${15 + i * 20}%`,
              top: `${35 + (i % 2) * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${5 + i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* vs divider glow */}
      <div className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-px w-[35vw] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-[#c9a84c]/15 to-transparent" />

      <TurnQueue
        turnQueue={gameState?.turnQueue ?? []}
        isYourTurn={isYourTurn}
        userPseudo={userPseudo}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl -translate-y-20 rounded-3xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {enemyTeam.map((character) => {
                const charState = findCharByHeroId(oppCharacters, character.identity.id);
                return (
                  <div key={character.identity.id} className="w-full opacity-90">
                    <EnemyFighter
                      character={character}
                      currentHp={charState?.currentHp}
                      effects={[]}
                      active={charState ? charState.uid === activeCharacterUid : false}
                    />
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {teamSelected.map((character, index) => {
                const charState = character
                  ? findCharByHeroId(myCharacters, character.identity.id)
                  : undefined;
                return (
                  <div key={character?.identity.id ?? `own-slot-${index}`}>
                    {character ? (
                      <Fighter
                        character={character}
                        active={
                          charState
                            ? charState.uid === activeCharacterUid
                            : selectedHero?.identity.id === character.identity.id
                        }
                        currentHp={charState?.currentHp}
                        currentMp={charState?.currentMp}
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-[#0f0e13] text-sm text-gray-500">
                        Vide
                      </div>
                    )}
                  </div>
                );
              })}
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

      {(() => {
        const forfeitBtn = (
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
        );

        const manaBar = (
          <div className="flex flex-col items-end gap-3">
            <ManaBar currentMana={activeMp} />
          </div>
        );

        const userInfo = (
          <ProfileInfo
            account={{ pseudo: userPseudo, profilePhoto: userAvatar }}
            className="self-end"
          />
        );

        return isYourTurn ? (
          <div className="grid w-full grid-cols-[minmax(0,1fr)_minmax(11rem,15rem)] gap-3 sm:gap-4 md:grid-cols-[minmax(0,7fr)_minmax(240px,280px)] md:items-stretch">
            <div className="min-w-0 flex items-end">
              <SpellSelector
                hero={selectedHeroCard}
                character={selectedCharacter}
                className="w-full"
              />
            </div>
            <div className="flex flex-col items-end gap-3 md:h-full md:justify-between">
              {manaBar}
              {forfeitBtn}
              {userInfo}
            </div>
          </div>
        ) : (
          <div className="flex w-full justify-end">
            <div className="flex flex-col items-end gap-3">
              {manaBar}
              {forfeitBtn}
              {userInfo}
            </div>
          </div>
        );
      })()}

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
        @keyframes star {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes star-delayed {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.7; }
        }
        @keyframes dust {
          0%, 100% { transform: translateY(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translateY(-40px); opacity: 0; }
        }
        .animate-aurora { animation: aurora 8s ease-in-out infinite; }
        .animate-sweep { animation: sweep 12s linear infinite; }
        .animate-star { animation: star 4s ease-in-out infinite; }
        .animate-star-delayed { animation: star-delayed 5s ease-in-out infinite; }
        .animate-dust { animation: dust 6s ease-out infinite; }
      `}</style>
    </div>
  );
}
