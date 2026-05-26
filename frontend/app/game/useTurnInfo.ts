"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { GameStatePayload, PlayerState, CharacterState, TurnQueueEntry } from "./types";

type UseTurnInfoReturn = {
  isYourTurn: boolean;
  myCharacters: CharacterState[];
  oppCharacters: CharacterState[];
  activeCharacterUid: string | null;
  activeHeroId: string | null;
  activeMp: number;
  isInfoModalOpen: boolean;
  setIsInfoModalOpen: (open: boolean) => void;
  isGameOver: boolean;
  isWinner: boolean;
};

function getPlayerChars(players: PlayerState[], playerIdx: number): CharacterState[] {
  return players[playerIdx]?.characters ?? [];
}

export function useTurnInfo(
  gameState: GameStatePayload | null,
  playerId: number | null,
): UseTurnInfoReturn {
  const prevTurnRef = useRef(0);
  const hasShownStartModal = useRef(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const isYourTurn = playerId !== null && gameState !== null
    ? gameState.activePlayerOwner === playerId
    : false;

  const myCharacters = playerId !== null && gameState
    ? getPlayerChars(gameState.players, playerId)
    : [];

  const oppCharacters = playerId !== null && gameState
    ? getPlayerChars(gameState.players, 1 - playerId)
    : [];

  const activeCharacterUid = gameState?.turnQueue[0]?.characterUid ?? null;
  const activeHeroId = activeCharacterUid?.split("_").at(-2) ?? null;

  const activeMp = useMemo(() => {
    if (!gameState || !activeCharacterUid) return 0;
    for (const player of gameState.players) {
      for (const char of player.characters) {
        if (char.uid === activeCharacterUid) return char.currentMp ?? 0;
      }
    }
    return 0;
  }, [gameState, activeCharacterUid]);

  const isGameOver = gameState?.gamePhase === "end";
  const isWinner = gameState?.winnerId === playerId;

  // Show InfoModal on game start or turn change
  useEffect(() => {
    if (!gameState || playerId === null) return;

    if (!hasShownStartModal.current) {
      hasShownStartModal.current = true;
      prevTurnRef.current = gameState.turn;
      setIsInfoModalOpen(true);
      return;
    }

    if (gameState.turn !== prevTurnRef.current) {
      prevTurnRef.current = gameState.turn;
      setIsInfoModalOpen(true);
    }
  }, [gameState, playerId]);

  return {
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
  };
}
