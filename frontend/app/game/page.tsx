"use client";

import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { spells, type Team, type GameAction } from "./index";
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
  const initStartedRef = useRef(false);
  const charsFetchedRef = useRef(false);

  // Targeting state
  const [targetingMode, setTargetingMode] = useState(false);
  const [confirmForfeit, setConfirmForfeit] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: "basic" | "skill";
    skillId?: string;
  } | null>(null);
  const [validTargetUids, setValidTargetUids] = useState<string[]>([]);

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

  const activeHeroId = activeCharacterUid?.split("_").at(-2) ?? null;
  const activeHeroDef = activeHeroId
    ? CHARACTERS.find(h => h.identity.id === activeHeroId) ?? null
    : null;

  // Get targeting type for a given skill on the active character
  function getSkillTargeting(skillId: string | undefined | null): string | null {
    if (!skillId || !activeHeroDef) return null;
    const skill = activeHeroDef.skills.find(s => s.id === skillId);
    if (!skill || !("targeting" in skill)) return null;
    return (skill as Record<string, unknown>).targeting as string;
  }

  // Determine valid target UIDs for the current pending action
  function getTargetsForAction(
    actionType: "basic" | "skill",
    skillId?: string,
  ): string[] {
    const targeting = actionType === "basic" ? "single" : getSkillTargeting(skillId ?? null);
    if (!targeting) return [];
    if (targeting === "self") return activeCharacterUid ? [activeCharacterUid] : [];
    if (targeting === "aoe" || targeting === "teamAoe") return [];
    if (targeting === "teamSingle") return myCharacters.map(c => c.uid);
    if (targeting === "single") return oppCharacters.map(c => c.uid);
    return [];
  }

  // Handle spell/basic click from SpellSelector
  function handleCastSpell(type: "basic" | "skill", skillId?: string) {
    const targeting = type === "basic" ? "single" : getSkillTargeting(skillId);
    console.log(`[GameClient] handleCastSpell — activeCharacterUid=${activeCharacterUid} activeHeroDef=${activeHeroDef?.identity?.id ?? "null"} oppChars=${oppCharacters.length} myChars=${myCharacters.length}`);
    if (!targeting || !activeCharacterUid) {
      console.log(`[GameClient] handleCastSpell cancelled — no targeting or uid (type=${type} skillId=${skillId} targeting=${targeting} uid=${activeCharacterUid})`);
      return;
    }
    console.log(`[GameClient] handleCastSpell — type=${type} skillId=${skillId ?? "none"} targeting=${targeting}`);

    // For AOE/self/teamAoe — submit immediately without targeting
    if (targeting === "aoe" || targeting === "self" || targeting === "teamAoe") {
      const action: GameAction = {
        type,
        skillId: type === "skill" ? skillId : undefined,
        userUid: activeCharacterUid,
        targetUids: targeting === "self" ? [activeCharacterUid] : [],
      };
      spells.submitAction(action);
      return;
    }

    // For single/teamSingle — enter targeting mode
    const targets = getTargetsForAction(type, skillId);
    if (targets.length === 0) {
      console.log(`[GameClient] handleCastSpell — targets.length === 0 (type=${type} skillId=${skillId ?? "none"} targeting=${targeting})`);
      return;
    }
    setPendingAction({ type, skillId });
    setValidTargetUids(targets);
    setTargetingMode(true);
  }

  // Handle clicking on a character (target or cancel)
  function handleTargetSelect(targetUid: string | null) {
    if (!targetingMode || !pendingAction || !activeCharacterUid) {
      console.log(`[GameClient] handleTargetSelect cancelled — no targeting mode or uid`);
      return;
    }
    if (targetUid === null) {
      console.log(`[GameClient] handleTargetSelect — cancelled (Escape)`);
      setTargetingMode(false);
      setPendingAction(null);
      setValidTargetUids([]);
      return;
    }
    const action: GameAction = {
      type: pendingAction.type,
      skillId: pendingAction.skillId,
      userUid: activeCharacterUid,
      targetUids: [targetUid],
    };
    console.log(`[GameClient] handleTargetSelect — submitting action type=${action.type} target=${targetUid}`);
    spells.submitAction(action);
    setTargetingMode(false);
    setPendingAction(null);
    setValidTargetUids([]);
  }

  // Skip turn
  function handleSkipTurn() {
    if (!activeCharacterUid) {
      console.log(`[GameClient] handleSkipTurn cancelled — no active character`);
      return;
    }
    const action: GameAction = {
      type: "skip",
      userUid: activeCharacterUid,
      targetUids: [],
    };
    console.log(`[GameClient] handleSkipTurn — uid=${activeCharacterUid}`);
    spells.submitAction(action);
  }

  // Game over state
  const isGameOver = gameState?.gamePhase === "end";
  const isWinner = gameState?.winnerId === playerId;

  // Cancel targeting on Escape
  useEffect(() => {
    if (!targetingMode) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        handleTargetSelect(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [targetingMode]);

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

    if (!initStartedRef.current) {
      initStartedRef.current = true;

      const getUserData = async (retries = 10) => {
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
        if (!ores.ok) {
          if (ores.status === 429 && retries > 0) {
            console.log(`[GameClient] rate limited, retrying... (${retries} left)`);
            await new Promise(r => setTimeout(r, 2000));
            return getUserData(retries - 1);
          }
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
    }

    return () => {
      socket.off("gameStateUpdate");
    };
  }, []);

  useEffect(() => {
    if (!userPseudo || charsFetchedRef.current) return;
    charsFetchedRef.current = true;

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

  // Auto-redirect to home after game over
  useEffect(() => {
    if (!isGameOver) return;
    const timer = setTimeout(() => router.push("/home"), 5000);
    return () => clearTimeout(timer);
  }, [isGameOver]);

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
                const dead = !charState;
                const isTargetable = targetingMode && !!charState && validTargetUids.some(
                  uid => uid === charState.uid
                );
                return (
                  <div key={character.identity.id} className={`w-full transition-opacity duration-300 ${dead ? "opacity-30 pointer-events-none" : "opacity-90"}`}>
                    <EnemyFighter
                      character={character}
                      currentHp={charState ? charState.currentHp : 0}
                      effects={[]}
                      active={charState ? charState.uid === activeCharacterUid : false}
                      onClick={isTargetable && charState ? () => handleTargetSelect(charState.uid) : undefined}
                      isTargetable={isTargetable}
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
                const dead = !charState;
                const isTargetable = targetingMode && !!charState && validTargetUids.some(
                  uid => uid === charState.uid
                );
                return (
                  <div key={character?.identity.id ?? `own-slot-${index}`}>
                    {character ? (
                      <div className={`transition-opacity duration-300 ${dead ? "opacity-30 pointer-events-none" : ""}`}>
                        <Fighter
                          character={character}
                          active={
                            charState
                              ? charState.uid === activeCharacterUid
                              : selectedHero?.identity.id === character.identity.id
                          }
                          currentHp={charState ? charState.currentHp : 0}
                          onClick={isTargetable && charState ? () => handleTargetSelect(charState.uid) : undefined}
                          isTargetable={isTargetable}
                        />
                      </div>
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
        const forfeitBtn = confirmForfeit ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { spells.forfeit(); setConfirmForfeit(false); router.push("/home"); }}
              className="group relative w-full overflow-hidden rounded-md border-2 border-red-700 bg-gradient-to-b from-[#2a0a0a] to-[#1a0505] px-4 py-2 font-serif text-sm font-semibold tracking-wide text-red-300 transition-all duration-150 hover:border-red-500 hover:text-red-100 hover:shadow-[0_0_14px_rgba(200,0,0,0.2)] md:w-auto"
            >
              <span className="relative z-10">Confirm forfeit?</span>
            </button>
            <button
              type="button"
              onClick={() => setConfirmForfeit(false)}
              className="group relative w-full overflow-hidden rounded-md border-2 border-[#3a3a3a] bg-gradient-to-b from-[#141414] to-[#0a0a0a] px-4 py-2 font-serif text-sm font-semibold tracking-wide text-[#8a8a8a] transition-all duration-150 hover:border-[#6a6a6a] hover:text-[#b0b0b0] md:w-auto"
            >
              <span className="relative z-10">Cancel</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmForfeit(true)}
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
            <div className="min-w-0 flex flex-col gap-2">
              <SpellSelector
                hero={selectedHeroCard}
                character={selectedCharacter}
                activeMp={activeMp}
                onCastSpell={handleCastSpell}
                className="w-full"
              />
              <button
                type="button"
                onClick={handleSkipTurn}
                className="group relative w-full overflow-hidden rounded-md border border-[#2a1f14] bg-gradient-to-b from-[#14100a] to-[#0f0a06] px-3 py-1.5 font-serif text-xs tracking-wide text-[#6a5a4a] transition-all duration-150 hover:border-[#5a4a3a] hover:text-[#8a7a5a]"
              >
                Skip Turn
              </button>
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

      {/* Game Over overlay */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="rounded-2xl border-2 border-[#c9a84c] bg-gradient-to-b from-[#1f1810] to-[#15100a] p-8 text-center shadow-[0_0_40px_rgba(201,168,76,0.15)]">
            <h1 className="font-serif text-3xl font-bold tracking-wide text-[#e8dcc8]">
              {isWinner ? "Victory!" : "Defeat"}
            </h1>
            <p className="mt-2 font-serif text-[#c9b896]">
              {isWinner ? "Your team emerges victorious!" : "Your team has been defeated."}
            </p>
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="mt-6 rounded-md border-2 border-[#c9a84c] bg-gradient-to-b from-[#c9a84c] to-[#a8883c] px-6 py-2 font-serif font-semibold text-[#0a0806] transition-all duration-150 hover:shadow-[0_0_14px_rgba(201,168,76,0.3)]"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

      {/* Targeting mode banner */}
      {targetingMode && (
        <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-center bg-gradient-to-b from-[#c9a84c]/20 to-transparent py-3">
          <div className="rounded-lg border border-[#c9a84c]/40 bg-[#1f1810] px-6 py-2 font-serif text-sm text-[#e8dcc8] shadow-[0_0_20px_rgba(201,168,76,0.15)]">
            Select a target — <button onClick={() => handleTargetSelect(null)} className="underline text-[#8a7a5a] hover:text-[#c9b896]">Cancel (Esc)</button>
          </div>
        </div>
      )}

      <InfoModal
        open={isInfoModalOpen && !isGameOver}
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
