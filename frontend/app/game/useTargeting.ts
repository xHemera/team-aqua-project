"use client";

import { useState, useEffect, useCallback } from "react";
import { CHARACTERS } from "@/public/gameResources/heroes";
import { spells, type GameAction } from "./index";
import type { CharacterState } from "./types";

type PendingAction = {
  type: "basic" | "skill";
  skillId?: string;
};

type UseTargetingReturn = {
  targetingMode: boolean;
  validTargetUids: Set<string>;
  confirmForfeit: boolean;
  setConfirmForfeit: (v: boolean) => void;
  handleCastSpell: (type: "basic" | "skill", skillId?: string) => void;
  handleTargetSelect: (targetUid: string | null) => void;
  handleSkipTurn: () => void;
};

function getSkillTargeting(
  skillId: string | undefined | null,
  activeHeroDef: (typeof CHARACTERS)[number] | null,
): string | null {
  if (!skillId || !activeHeroDef) return null;
  const skill = activeHeroDef.skills.find(s => s.id === skillId);
  if (!skill) return null;
  if (!("targeting" in skill)) return null;
  const targeting = (skill as Record<string, unknown>).targeting;
  return typeof targeting === "string" ? targeting : null;
}

function getTargetsFromTargeting(
  targeting: string | null,
  activeCharacterUid: string | null,
  myCharacters: CharacterState[],
  oppCharacters: CharacterState[],
): string[] {
  if (!targeting) return [];
  if (targeting === "self") return activeCharacterUid ? [activeCharacterUid] : [];
  if (targeting === "aoe" || targeting === "teamAoe") return [];
  if (targeting === "teamSingle") return myCharacters.map(c => c.uid);
  if (targeting === "single") return oppCharacters.map(c => c.uid);
  return [];
}

export function useTargeting(
  activeCharacterUid: string | null,
  myCharacters: CharacterState[],
  oppCharacters: CharacterState[],
  activeHeroDef: (typeof CHARACTERS)[number] | null,
): UseTargetingReturn {
  const [targetingMode, setTargetingMode] = useState(false);
  const [confirmForfeit, setConfirmForfeit] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [validTargetUids, setValidTargetUids] = useState<Set<string>>(new Set());

  const handleCastSpell = useCallback((type: "basic" | "skill", skillId?: string) => {
    const targeting = type === "basic" ? "single" : getSkillTargeting(skillId, activeHeroDef);
    if (!targeting || !activeCharacterUid) return;

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
    const targets = getTargetsFromTargeting(targeting, activeCharacterUid, myCharacters, oppCharacters);
    if (targets.length === 0) return;

    setPendingAction({ type, skillId });
    setValidTargetUids(new Set(targets));
    setTargetingMode(true);
  }, [activeCharacterUid, activeHeroDef, myCharacters, oppCharacters]);

  const handleTargetSelect = useCallback((targetUid: string | null) => {
    if (!targetingMode || !pendingAction || !activeCharacterUid) return;

    if (targetUid === null) {
      setTargetingMode(false);
      setPendingAction(null);
      setValidTargetUids(new Set());
      return;
    }

    const action: GameAction = {
      type: pendingAction.type,
      skillId: pendingAction.skillId,
      userUid: activeCharacterUid,
      targetUids: [targetUid],
    };
    spells.submitAction(action);
    setTargetingMode(false);
    setPendingAction(null);
    setValidTargetUids(new Set());
  }, [targetingMode, pendingAction, activeCharacterUid]);

  const handleSkipTurn = useCallback(() => {
    if (!activeCharacterUid) return;
    const action: GameAction = {
      type: "skip",
      userUid: activeCharacterUid,
      targetUids: [],
    };
    spells.submitAction(action);
  }, [activeCharacterUid]);

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
  }, [targetingMode, handleTargetSelect]);

  return {
    targetingMode,
    validTargetUids,
    confirmForfeit,
    setConfirmForfeit,
    handleCastSpell,
    handleTargetSelect,
    handleSkipTurn,
  };
}
