"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { spells, type Team } from "./index";
import { emitGlobalError } from "@/lib/error-events";
import type { CharacterData } from "@/components/organisms/characters/types";

export type LoadingPhase = "connecting" | "fetching" | "loaded" | "error";

export function useGameData() {
  const [userPseudo, setUserPseudo] = useState("");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [oppAvatar, setOppAvatar] = useState<string | null>(null);
  const [playerCharacters, setPlayerCharacters] = useState<CharacterData[] | null>(null);
  const [team, setTeam] = useState<string[] | null>([]);
  const [oppTeam, setOppTeam] = useState<string[] | null>([]);
  const [opponent, setOpponent] = useState("");
  const [roomId, setRoomId] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>("connecting");

  useEffect(() => {
    console.log("[GameData] useEffect mount — fetching...");
    let cancelled = false;

    async function load() {
      try {
        setLoadingPhase("fetching");
        console.log("[GameData] Step 1: fetching session...");

        const { data } = await authClient.getSession();
        console.log("[GameData] Step 2: session result:", data?.user?.name ?? "null");
        if (cancelled) return;
        if (!data || !data.user.name) throw new Error("Session non trouvée");
        setUserPseudo(data.user.name);
        console.log("[GameData] Step 3: pseudo set, fetching team+opponent...");

        await loadTeamAndOpponent(data.user.name);
        if (cancelled) return;

        console.log("[GameData] Step 4: team+opponent done, setting loaded");
        setLoadingPhase("loaded");

        await Promise.all([
          loadPlayerCharacters(data.user.name),
          loadProfileAvatar(),
        ]);
        console.log("[GameData] Step 5: secondary data loaded (characters, avatar)");
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Une erreur est survenue";
        console.log("[GameData] ERROR caught:", message, err);
        emitGlobalError(message);
        setLoadingPhase("error");
      }
    }

    async function loadTeamAndOpponent(pseudo: string) {
      console.log("[GameData] loadTeamAndOpponent — fetching /api/user and /api/user/opponent for", pseudo);
      const [cres, ores] = await Promise.all([
        fetch(`/api/user?pseudo=${pseudo}`, { method: "GET" }),
        fetch(`/api/user/opponent?pseudo=${pseudo}`, { method: "GET" }),
      ]);
      console.log("[GameData] cres status:", cres.status, "ores status:", ores.status);

      if (!cres.ok || !ores.ok) {
        console.log("[GameData] One or both API calls failed. cres.ok:", cres.ok, "ores.ok:", ores.ok);
        if (ores.status === 429) {
          console.log("[GameData] 429 rate limit, retrying with backoff...");
          const result = await retryWithBackoff(async () => {
            if (cancelled) return null;
            const [cres2, ores2] = await Promise.all([
              fetch(`/api/user?pseudo=${pseudo}`, { method: "GET" }),
              fetch(`/api/user/opponent?pseudo=${pseudo}`, { method: "GET" }),
            ]);
            if (!cres2.ok || !ores2.ok) return null;
            const res2 = await cres2.json();
            const opp2 = await ores2.json();
            return { res: res2, opp: opp2 };
          }, () => cancelled);
          if (!result || cancelled) return;
          finishInit(pseudo, result.res, result.opp);
          return;
        }
        console.log("[GameData] Throwing error: API responded with status", cres.status, ores.status);
        throw new Error("Impossible de récupérer les données adverses");
      }

      console.log("[GameData] Parsing JSON responses...");
      const res = await cres.json();
      const opp = await ores.json();
      console.log("[GameData] cres.team:", res.team, "opp.name:", opp.name, "opp.team:", opp.team);
      finishInit(pseudo, res, opp);
    }

    function finishInit(pseudo: string, res: { team: string[]; levels: number[]; spellsLevels: number[] }, opp: { name: string; team: string[]; avatar: string | null; roomId: number }) {
      console.log("[GameData] finishInit called — team:", res.team, "opponent:", opp.name);
      const teamData: Team = {
        owner: pseudo,
        characters: res.team,
        levels: res.levels,
        skillsLevels: res.spellsLevels,
      };
      setTeam(res.team);
      setOpponent(opp.name);
      setOppTeam(opp.team);
      setOppAvatar(opp.avatar);
      setRoomId(opp.roomId);
      spells.initialData(teamData, opp.roomId);
      console.log("[GameData] finishInit done — states set");
    }

    async function loadPlayerCharacters(pseudo: string) {
      try {
        const response = await fetch(
          `/api/characters?username=${encodeURIComponent(pseudo)}`,
          { method: "GET", cache: "no-store" },
        );
        if (response.ok && !cancelled) {
          const payload = await response.json() as { characters: CharacterData[] };
          setPlayerCharacters(payload.characters);
        }
      } catch {
        // Non-critical, silently ignore
      }
    }

    async function loadProfileAvatar() {
      try {
        const response = await fetch("/api/profile/", {
          method: "GET",
          cache: "no-store",
        });
        if (response.ok && !cancelled) {
          const profile = await response.json() as {
            image: string | null;
            avatar: { url: string | null } | null;
          };
          setUserAvatar(profile.image ?? profile.avatar?.url ?? null);
        }
      } catch {
        // Non-critical, silently ignore
      }
    }

    load();

    return () => { cancelled = true; console.log("[GameData] cleanup — cancelled"); };
  }, []);

  console.log("[GameData] render — loadingPhase:", loadingPhase, "userPseudo:", userPseudo, "team:", team, "oppTeam:", oppTeam);

  return {
    userPseudo,
    userAvatar,
    oppAvatar,
    playerCharacters,
    team,
    oppTeam,
    opponent,
    roomId,
    loadingPhase,
  };
}

async function retryWithBackoff<T>(
  fn: () => Promise<T | null>,
  isCancelled: () => boolean,
  maxRetries = 10,
  delay = 2000,
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    if (isCancelled()) return null;
    const result = await fn();
    if (result !== null) return result;
    if (isCancelled()) return null;
    await new Promise(r => setTimeout(r, delay));
  }
  return null;
}
