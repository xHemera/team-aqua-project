"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { CHARACTERS, HERO_MAP } from "@/public/gameResources/heroes";
import { useGameData } from "./useGameData";
import { useGameSocket } from "./useGameSocket";
import { useTurnInfo } from "./useTurnInfo";
import { useTargeting } from "./useTargeting";
import ProfileInfo from "@/components/atoms/game/ProfileInfo";
import Fighter from "@/components/atoms/game/Fighter";
import TurnQueue from "@/components/atoms/game/TurnQueue";
import InfoModal from "@/components/atoms/game/InfoModal";
import GameLoadingScreen from "@/components/atoms/game/GameLoadingScreen";
import GameArenaBackground from "@/components/backgrounds/GameArenaBackground";
import BottomBar from "@/components/backgrounds/BottomBar";
import type { CharacterState } from "./types";

function findCharByHeroId(chars: CharacterState[] | undefined, heroId: string) {
  return chars?.find(c => c.uid.split("_").at(-2) === heroId) ?? null;
}

export default function Game() {
  const router = useRouter();
  const {
    userPseudo,
    userAvatar,
    oppAvatar,
    playerCharacters,
    team,
    oppTeam,
    opponent,
    roomId,
    loadingPhase: dataPhase,
  } = useGameData();

  const { gameState, playerId } = useGameSocket(userPseudo, opponent);

  const {
    isYourTurn,
    myCharacters,
    oppCharacters,
    activeCharacterUid,
    activeHeroId,
    activeMp,
    isInfoModalOpen,
    setIsInfoModalOpen,
    isGameOver,
    isWinner,
  } = useTurnInfo(gameState, playerId);

  // Active hero definition
  const activeHeroDef = useMemo(() => {
    if (activeHeroId) return HERO_MAP.byId.get(activeHeroId) ?? null;
    return null;
  }, [activeHeroId]);

  const {
    targetingMode,
    validTargetUids,
    confirmForfeit,
    setConfirmForfeit,
    handleCastSpell,
    handleTargetSelect,
    handleSkipTurn,
  } = useTargeting(activeCharacterUid, myCharacters, oppCharacters, activeHeroDef);

  // Team selection mapping — string[] → hero definitions
  const [teamSelected, setTeamSelected] = useState<Array<(typeof CHARACTERS)[number] | null> | null>(null);

  useEffect(() => {
    if (team) {
      const mapped = team.map((id) =>
        id ? (HERO_MAP.byName.get(id) ?? null) : null,
      );
      setTeamSelected(mapped);
      return;
    }
    // fallback: first three characters (original behavior)
    setTeamSelected(CHARACTERS.slice(0, 3));
  }, [team]);

  // Selected hero for spells — active character, or first team member
  const selectedHero = useMemo(() => {
    if (gameState && activeHeroDef) return activeHeroDef;
    if (teamSelected?.[0]) return teamSelected[0];
    return null;
  }, [gameState, activeHeroDef, teamSelected]);

  // Auto-redirect to home after game over
  useEffect(() => {
    if (!isGameOver) return;
    const timer = setTimeout(() => router.push("/home"), 5000);
    const history = async () => {
      await fetch("/api/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({pseudo: userPseudo, team: team,
          oppName: opponent, oppTeam: oppTeam, winner: isWinner}),
      })
    };
    history();
    return () => clearTimeout(timer);
  }, [isGameOver, router]);

  // Loading states
  console.log("[GamePage] render check — dataPhase:", dataPhase, "teamSelected:", !!teamSelected, "oppTeam:", oppTeam, "gameState:", !!gameState);
  if (dataPhase === "error") {
    return <GameLoadingScreen phase="error" />;
  }
  if (dataPhase !== "loaded") {
    return <GameLoadingScreen phase={dataPhase} />;
  }
  if (!teamSelected || !oppTeam) {
    console.log("[GamePage] blocked — teamSelected or oppTeam missing. teamSelected:", teamSelected, "oppTeam:", oppTeam);
    return (
      <div className="flex w-full justify-center px-4">
        <div className="rounded border border-[#3c3650] bg-[#0f0e13] p-4 text-[#cfc8e6]">
          Chargement...
        </div>
      </div>
    );
  }
  if (!gameState) {
    return <GameLoadingScreen phase="waiting" />;
  }

  // --- Render helpers ---
  const firstHero = teamSelected[0] ?? HERO_MAP.byId.get("archer");
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
    .map((id) => HERO_MAP.byName.get(id) ?? null)
    .filter((c): c is (typeof CHARACTERS)[number] => Boolean(c));

  const selectedHeroCard = selectedHero ?? firstHero;
  const selectedCharacter =
    playerCharacters?.find((c) => c.name === selectedHeroCard.identity.name) ?? null;

  // --- Targeting helpers for render ---
  const isTarget = (uid: string | undefined, _chars: CharacterState[]) =>
    targetingMode && !!uid && validTargetUids.has(uid);

  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden px-4 py-4 text-[16px] leading-7 text-[#f5e6c8]"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <GameArenaBackground />

      <TurnQueue
        turnQueue={gameState?.turnQueue ?? []}
        isYourTurn={isYourTurn}
        userPseudo={userPseudo}
      />

      {/* Arena */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-4xl -translate-y-20 rounded-3xl">
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Enemy team */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {enemyTeam.map((character) => {
                const charState = findCharByHeroId(oppCharacters, character.identity.id);
                const dead = !charState;
                return (
                  <div key={character.identity.id} className={`w-full transition-opacity duration-300 ${dead ? "opacity-30 pointer-events-none" : "opacity-90"}`}>
                    <Fighter
                      variant="enemy"
                      character={character}
                      currentHp={charState ? charState.currentHp : 0}
                      effects={[]}
                      active={charState ? charState.uid === activeCharacterUid : false}
                      onClick={isTarget(charState?.uid, oppCharacters) && charState ? () => handleTargetSelect(charState.uid) : undefined}
                      isTargetable={isTarget(charState?.uid, oppCharacters)}
                    />
                  </div>
                );
              })}
            </div>

            {/* Player team */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {teamSelected.map((character, index) => {
                const charState = character
                  ? findCharByHeroId(myCharacters, character.identity.id)
                  : undefined;
                const dead = !charState;
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
                          onClick={isTarget(charState?.uid, myCharacters) && charState ? () => handleTargetSelect(charState.uid) : undefined}
                          isTargetable={isTarget(charState?.uid, myCharacters)}
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

      {/* Opponent info */}
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-start justify-end gap-4">
          <ProfileInfo account={{ pseudo: opponent, profilePhoto: oppAvatar }} />
        </div>
        <p className="text-xs text-[#8b82a6]">
          Session ID: {roomId || "—"}
        </p>
      </div>

      <div className="mt-auto" />

      <BottomBar
        isYourTurn={isYourTurn}
        activeMp={activeMp}
        confirmForfeit={confirmForfeit}
        setConfirmForfeit={setConfirmForfeit}
        selectedHeroCard={selectedHeroCard}
        selectedCharacter={selectedCharacter}
        handleCastSpell={handleCastSpell}
        handleSkipTurn={handleSkipTurn}
        userPseudo={userPseudo}
        userAvatar={userAvatar}
      />

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
    </div>
  );
}
