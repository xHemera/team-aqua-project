"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import FeatureActionTile from "@/components/atoms/home/FeatureActionTile";
import PvpMatchmakingModal from "@/components/organisms/home/PvpMatchmakingModal";
import ExpeditionModal from "@/components/organisms/home/ExpeditionModal";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import MatchmakingModal from "@/components/organisms/home/MatchmakingModal";
import NotificationToast from "@/components/organisms/home/NotificationToast";
import PlayCta from "@/components/organisms/home/PlayCta";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import Button from "@/components/atoms/Button";
import { CHARACTERS, PLAYER_RESOURCES } from "@/app/characters/characters-data";
import Sidebar from "@/components/Sidebar";
import {socket} from "../../socket"

type ActiveExpedition = {
  characterId: string;
  startedAt: number;
  endsAt: number;
  durationSeconds: number;
  durationLabel: string;
  xp: number;
  gold: number;
};

type ExpeditionReward = {
  characterId: string;
  xp: number;
  gold: number;
};

type MinePopup = {
  id: number;
  value: number;
  x: number;
  y: number;
};

type TeamDragState = {
  id: string;
  x: number;
  y: number;
};

type PendingTeamDragState = {
  id: string;
  startX: number;
  startY: number;
};

const EXPEDITION_DURATIONS = [
  { id: "scout", label: "15s", seconds: 15, xp: 120, gold: 280 },
  { id: "journey", label: "45s", seconds: 45, xp: 340, gold: 720 },
  { id: "odyssey", label: "90s", seconds: 90, xp: 760, gold: 1540 },
] as const;

const STORAGE_KEYS = {
  ruby: "home-ruby",
  gold: "home-gold",
  team: "home-team-slots",
};

const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

// Page Home: hub de progression front-only (Mine, PvP, Expedition, Team Builder).
export default function Home() {

  const roster = useMemo(
    () => CHARACTERS.slice(0, 6).map((character) => ({
      id: character.id,
      name: character.name,
      portrait: character.portrait,
    })),
    [],
  );

  const defaultCharacterId = roster[0]?.id ?? null;
  const [pseudo, setPseudo] = useState<string>("Hero");
  const [ruby, setRuby] = useState<number>(PLAYER_RESOURCES.ruby);
  const [gold, setGold] = useState<number>(PLAYER_RESOURCES.coin);

  const [pvpOpen, setPvpOpen] = useState(false);
  const [minePopups, setMinePopups] = useState<MinePopup[]>([]);
  const minePopupIdRef = useRef(0);

  const [expeditionOpen, setExpeditionOpen] = useState(false);
  const [selectedExpeditionCharacterId, setSelectedExpeditionCharacterId] = useState<string | null>(defaultCharacterId);
  const [selectedDurationId, setSelectedDurationId] = useState<string>(EXPEDITION_DURATIONS[0].id);
  const [activeExpedition, setActiveExpedition] = useState<ActiveExpedition | null>(null);
  const [expeditionReward, setExpeditionReward] = useState<ExpeditionReward | null>(null);
  const [nowTs, setNowTs] = useState<number>(Date.now());

  const [teamSlots, setTeamSlots] = useState<Array<string | null>>([roster[0]?.id ?? null, roster[1]?.id ?? null, roster[2]?.id ?? null]);
  const [dragPreview, setDragPreview] = useState<TeamDragState | null>(null);
  const [hoveredSlotIndex, setHoveredSlotIndex] = useState<number | null>(null);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pendingDragRef = useRef<PendingTeamDragState | null>(null);
  const activeDragRef = useRef<TeamDragState | null>(null);
  const suppressClickForIdRef = useRef<string | null>(null);
  const router = useRouter();
  const [showMatchmaking, setShowMatchmaking] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [notifSender, setNotifSender] = useState<string | null>(null);
  const [userPseudo, setUserPseudo] = useState<string | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const { data } = await authClient.getSession();
      if (data?.user?.name) {
        setPseudo(data.user.name);
      }
    };
    void getUserData();
  }, []);

  useEffect(() => {
      if (!userPseudo || socket.connected) return;
  
      socket.connect();
      socket.emit("login", userPseudo);
      return () => {
        socket.off("online_users");
      };
    }, [userPseudo]);
    
  //render messages sent by other users
  useEffect(() => {
    if (!userPseudo) return;
    const storedRuby = localStorage.getItem(STORAGE_KEYS.ruby);
    const storedGold = localStorage.getItem(STORAGE_KEYS.gold);
    const storedTeam = localStorage.getItem(STORAGE_KEYS.team);

    socket.on("received", async ({sender, receiver, msg}) => {
      setNotification(msg);
      setNotifSender(sender);
      setShowNotification(true);
    });

    if (storedRuby && !Number.isNaN(Number(storedRuby))) {
      setRuby(Number(storedRuby));
    }
    if (storedGold && !Number.isNaN(Number(storedGold))) {
      setGold(Number(storedGold));
    }
    if (storedTeam) {
      try {
        const parsed = JSON.parse(storedTeam) as Array<string | null>;
        if (Array.isArray(parsed) && parsed.length === 3) {
          setTeamSlots(parsed);
        }
      } catch {
        // Ignore malformed storage value.
      }
    }
  }, [userPseudo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ruby, String(ruby));
  }, [ruby]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.gold, String(gold));
  }, [gold]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.team, JSON.stringify(teamSlots));
  }, [teamSlots]);

  useEffect(() => {
    if (!activeExpedition) {
      return;
    }

    const interval = window.setInterval(() => {
      setNowTs(Date.now());
    }, 120);

    return () => {
      window.clearInterval(interval);
    };
  }, [activeExpedition]);

  useEffect(() => {
    if (!activeExpedition || nowTs < activeExpedition.endsAt) {
      return;
    }

    setExpeditionReward({
      characterId: activeExpedition.characterId,
      xp: activeExpedition.xp,
      gold: activeExpedition.gold,
    });
    setActiveExpedition(null);
  }, [activeExpedition, nowTs]);

  const expeditionRemainingSeconds = activeExpedition
    ? Math.max(0, Math.ceil((activeExpedition.endsAt - nowTs) / 1000))
    : 0;

  const handleMine = (event: React.MouseEvent<HTMLButtonElement>) => {
    const reward = Math.floor(Math.random() * 24) + 12;
    setRuby((current) => current + reward);
    minePopupIdRef.current += 1;
    const popupId = minePopupIdRef.current;
    setMinePopups((current) => [
      ...current,
      { id: popupId, value: reward, x: event.clientX, y: event.clientY },
    ]);

    window.setTimeout(() => {
      setMinePopups((current) => current.filter((popup) => popup.id !== popupId));
    }, 900);
  };

  const handleStartPvp = () => {
    setPvpOpen(true);
  };

  const handleCancelPvp = () => {
    setPvpOpen(false);
  };

  const handleClosePvp = () => {
    handleCancelPvp();
    setPvpOpen(false);
  };

  const handleStartExpedition = () => {
    if (!selectedExpeditionCharacterId || activeExpedition) {
      return;
    }

    const selectedDuration = EXPEDITION_DURATIONS.find((duration) => duration.id === selectedDurationId);
    if (!selectedDuration) {
      return;
    }

    const startedAt = Date.now();
    setActiveExpedition({
      characterId: selectedExpeditionCharacterId,
      startedAt,
      endsAt: startedAt + selectedDuration.seconds * 1000,
      durationSeconds: selectedDuration.seconds,
      durationLabel: selectedDuration.label,
      xp: selectedDuration.xp,
      gold: selectedDuration.gold,
    });
    setExpeditionOpen(false);
  };

  const handleClaimExpeditionReward = () => {
    if (!expeditionReward) {
      return;
    }

    setGold((current) => current + expeditionReward.gold);
    setExpeditionReward(null);
  };

  const handleDropToTeamSlot = (slotIndex: number, characterId: string) => {
    if (slotIndex < 0 || slotIndex > 2) {
      return;
    }

    setTeamSlots((current) => {
      const next = [...current];
      const existingIndex = next.findIndex((slotCharacterId) => slotCharacterId === characterId);

      if (existingIndex !== -1) {
        next[existingIndex] = null;
      }

      next[slotIndex] = characterId;
      return next;
    });
  };

  const getSlotIndexAtPoint = (clientX: number, clientY: number) => {
    for (let index = 0; index < slotRefs.current.length; index += 1) {
      const slot = slotRefs.current[index];
      if (!slot) {
        continue;
      }

      const rect = slot.getBoundingClientRect();
      const isInside = clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
      if (isInside) {
        return index;
      }
    }
    return null;
  };

  const handleRosterPointerDown = (event: React.PointerEvent<HTMLButtonElement>, characterId: string) => {
    if (event.button !== 0) {
      return;
    }

    pendingDragRef.current = {
      id: characterId,
      startX: event.clientX,
      startY: event.clientY,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const pending = pendingDragRef.current;
      const active = activeDragRef.current;
      if (!pending && !active) {
        return;
      }

      if (!active && pending) {
        const distanceX = moveEvent.clientX - pending.startX;
        const distanceY = moveEvent.clientY - pending.startY;
        const movedEnough = Math.hypot(distanceX, distanceY) >= 6;
        if (!movedEnough) {
          return;
        }

        const started: TeamDragState = {
          id: pending.id,
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        };
        activeDragRef.current = started;
        pendingDragRef.current = null;
        suppressClickForIdRef.current = started.id;
        setDragPreview(started);
      }

      const current = activeDragRef.current;
      if (!current) {
        return;
      }

      const updated: TeamDragState = {
        ...current,
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };
      activeDragRef.current = updated;
      setDragPreview(updated);
      setHoveredSlotIndex(getSlotIndexAtPoint(moveEvent.clientX, moveEvent.clientY));
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      const current = activeDragRef.current;
      if (current) {
        const slotIndex = getSlotIndexAtPoint(upEvent.clientX, upEvent.clientY);
        if (slotIndex !== null) {
          handleDropToTeamSlot(slotIndex, current.id);
        }
      }

      pendingDragRef.current = null;
      activeDragRef.current = null;
      setDragPreview(null);
      setHoveredSlotIndex(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  };

  const teamPowerLabel = `${teamSlots.filter(Boolean).length}/3`;
  const expeditionLabel = activeExpedition
    ? `In progress • ${formatTimer(expeditionRemainingSeconds)}`
    : expeditionReward
      ? "Reward ready"
      : "Ready";

  const getTeamCharacter = (id: string | null) => roster.find((character) => character.id === id) ?? null;
  const isCharacterInTeam = (characterId: string) => teamSlots.includes(characterId);
  const activeExpeditionCharacter = activeExpedition
    ? roster.find((character) => character.id === activeExpedition.characterId) ?? null
    : null;
  const expeditionProgress = activeExpedition
    ? Math.max(0, Math.min(1, (nowTs - activeExpedition.startedAt) / (activeExpedition.durationSeconds * 1000)))
    : 0;
  const expeditionProgressPercent = expeditionProgress * 100;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0c0a0f] font-serif text-white">
      <div className="shrink-0 p-3 pl-2">
        <Sidebar />
      </div>

      <main className="relative flex-1 overflow-hidden p-3 pl-0">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#0c0a0f] via-[#12101a] to-[#0a0810]" />
        <div
          className="absolute inset-0 rounded-3xl opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-4 rounded-3xl border border-[#c9a227]/25 bg-black/15 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#c9a227]/30 bg-[#120f17]/85 px-4 py-3">
            <div className="text-sm uppercase tracking-[0.12em] text-[#ead9aa]">
              {pseudo}
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-[#f5e6c8]">
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#6a5b81] bg-[#1e1828] px-3 py-1.5">
                <i className="fa-solid fa-gem text-[#cd5c5c]" aria-hidden="true" />
                {ruby}
              </span>
              <span className="inline-flex items-center gap-2 rounded-lg border border-[#6a5b81] bg-[#1e1828] px-3 py-1.5">
                <i className="fa-solid fa-coins text-[#f2c658]" aria-hidden="true" />
                {gold}
              </span>
            </div>
          </div>

          {expeditionReward && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#4b8f65]/70 bg-[#122019] px-4 py-3 text-[#dcffe9]">
              <div className="text-sm uppercase tracking-wider">
                Expedition complete • +{expeditionReward.xp} XP • +{expeditionReward.gold} Gold
              </div>
              <Button type="button" size="sm" onClick={handleClaimExpeditionReward} className="font-bold uppercase tracking-wider">
                Claim
              </Button>
            </div>
          )}

          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <button
                type="button"
                onClick={handleMine}
                className="mine-clicker group relative flex min-h-[150px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-[#c9a227]/30 bg-[#120f17]/90 p-4 text-left shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-[1.01] hover:border-[#e6c55a]/60"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2a2234]/0 via-[#7a3f2e]/35 to-[#c7662d]/35" />
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className="text-xl font-black uppercase tracking-[0.14em] text-[#f5e6c8]"
                    style={{ fontFamily: "var(--font-display), serif" }}
                  >
                    Mine
                  </span>
                  <i className="fa-solid fa-hammer text-lg text-[#e6c55a]" aria-hidden="true" />
                </div>

                <div className="relative z-10 mt-4 flex items-center justify-between">
                  <div className="h-px flex-1 bg-gradient-to-r from-[#e6c55a]/60 to-transparent" />
                  <span className="ml-3 text-xs font-semibold uppercase tracking-wider text-[#f0dfb1]">Click</span>
                </div>
              </button>

              <FeatureActionTile
                title="PvP"
                icon="fa-swords"
                accentClassName="bg-gradient-to-br from-[#241d30]/0 via-[#4d2f57]/35 to-[#b15b45]/35"
                value="Queue"
                onClick={handleStartPvp}
              />

              <FeatureActionTile
                title="Expedition"
                icon="fa-compass"
                accentClassName="bg-gradient-to-br from-[#1e2a32]/0 via-[#355366]/35 to-[#7a9162]/35"
                value={expeditionLabel}
                content={
                  activeExpeditionCharacter ? (
                    <div>
                      <div className="expedition-walk-lane" style={{ "--expedition-progress": `${expeditionProgressPercent.toFixed(2)}%` } as CSSProperties}>
                        <div className="expedition-node expedition-node-start" aria-hidden="true">
                          <i className="fa-solid fa-campground" />
                        </div>
                        <div className="expedition-node expedition-node-end" aria-hidden="true">
                          <i className="fa-solid fa-flag-checkered" />
                        </div>
                        <div
                          className="expedition-walker"
                          style={{ left: `clamp(18px, ${expeditionProgressPercent.toFixed(2)}%, calc(100% - 18px))` }}
                        >
                          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#c9a227]/80 bg-[#1e1828]">
                            <Image
                              src={activeExpeditionCharacter.portrait}
                              alt={activeExpeditionCharacter.name}
                              fill
                              className="object-cover"
                              draggable={false}
                            />
                          </div>
                        </div>
                      </div>  
                      
                    </div>
                  ) : null
                }
                onClick={() => setExpeditionOpen(true)}
              />
            </div>

            <div className="rounded-2xl p-2">
              <div className="mb-3 flex items-center justify-between">
                <h2
                  className="text-lg font-black uppercase tracking-[0.12em] text-[#f5e6c8]"
                  style={{ fontFamily: "var(--font-display), serif" }}
                >
                  Team Builder
                </h2>
                <span className="rounded-lg border border-[#6a5b81] bg-[#1e1828] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#e6d39e]">
                  {teamPowerLabel}
                </span>
              </div>

              <div className="space-y-2.5">
                <section className="flex w-full justify-center p-2">
                  <div className="inline-flex flex-col items-center">
                    <div className="mb-2 w-full text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9b48a]">Active Team</div>
                    <div className="grid w-fit grid-cols-3 justify-items-center gap-1.5">
                    {teamSlots.map((slotCharacterId, index) => {
                      const selectedCharacter = getTeamCharacter(slotCharacterId);
                      const isSlotHovered = hoveredSlotIndex === index;
                      return (
                        <div
                          key={`home-team-slot-${index}`}
                          ref={(element) => {
                            slotRefs.current[index] = element;
                          }}
                          className={`relative w-[112px] overflow-hidden rounded-lg border border-dashed bg-[#120f17] transition-colors ${
                            isSlotHovered ? "border-[#c9a227]" : "border-[#6b5a84]"
                          }`}
                        >
                          {selectedCharacter ? (
                            <>
                              <div className="relative aspect-[3/4] w-full">
                                <Image src={selectedCharacter.portrait} alt={selectedCharacter.name} fill className="object-cover" />
                              </div>
                              <div className="flex items-center justify-between bg-[#1a1422] px-1.5 py-0.5">
                                <span className="truncate text-[9px] font-semibold uppercase tracking-wider text-[#ead9aa]">
                                  {selectedCharacter.name}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTeamSlots((current) => {
                                      const next = [...current];
                                      next[index] = null;
                                      return next;
                                    });
                                  }}
                                  className="text-[10px] text-[#e6c55a]"
                                  aria-label={`Clear slot ${index + 1}`}
                                >
                                  ×
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex aspect-[3/4] w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-[#7b6d93]">
                              Slot {index + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  </div>
                </section>

                <section className="flex w-full justify-center p-2">
                  <div className="inline-flex flex-col items-center">
                    <div className="mb-2 w-full text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9b48a]">Roster</div>
                    <div className="flex justify-center gap-1.5">
                    {roster.map((character) => {
                      const inTeam = isCharacterInTeam(character.id);
                      return (
                        <button
                          key={character.id}
                          type="button"
                          onPointerDown={(event) => handleRosterPointerDown(event, character.id)}
                          onClick={() => {
                            if (suppressClickForIdRef.current === character.id) {
                              suppressClickForIdRef.current = null;
                              return;
                            }

                            const freeSlot = teamSlots.findIndex((slot) => slot === null);
                            handleDropToTeamSlot(freeSlot === -1 ? 0 : freeSlot, character.id);
                          }}
                          className={`group w-[86px] overflow-hidden rounded-lg border text-left transition-all ${
                            inTeam
                              ? "border-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                              : "border-[#433556] hover:border-[#7a6599]"
                          } ${dragPreview?.id === character.id ? "opacity-50" : ""}`}
                        >
                          <div className="relative aspect-[3/4] w-full">
                            <Image src={character.portrait} alt={character.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" draggable={false} />
                          </div>
                          <div className="truncate bg-[#1a1422] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#ead9aa]">
                            {character.name}
                          </div>
                        </button>
                      );
                    })}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

      </main>

      {minePopups.map((popup) => (
        <span
          key={popup.id}
          className="mine-reward-pop pointer-events-none fixed z-[70] text-3xl font-black text-[#ffcf63] [text-shadow:0_2px_10px_rgba(0,0,0,0.75)]"
          style={{
            fontFamily: "var(--font-display), serif",
            left: `${popup.x}px`,
            top: `${popup.y - 10}px`,
          }}
        >
          +{popup.value}
        </span>
      ))}

      {dragPreview && (() => {
        const draggedCharacter = roster.find((character) => character.id === dragPreview.id);
        if (!draggedCharacter) {
          return null;
        }

        return (
          <div
            className="pointer-events-none fixed z-[80] w-[96px] overflow-hidden rounded-lg border border-[#c9a227] bg-[#171220] shadow-[0_10px_28px_rgba(0,0,0,0.55)]"
            style={{
              left: `${dragPreview.x - 48}px`,
              top: `${dragPreview.y - 80}px`,
            }}
          >
            <div className="relative aspect-[3/4] w-full">
              <Image src={draggedCharacter.portrait} alt={draggedCharacter.name} fill className="object-cover" draggable={false} />
            </div>
            <div className="truncate bg-[#1a1422] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-[#ead9aa]">
              {draggedCharacter.name}
            </div>
          </div>
        );
      })()}

      <PvpMatchmakingModal
        open={pvpOpen}
        onClose={handleClosePvp}
        onCancel={handleCancelPvp}
      />

      <ExpeditionModal
        open={expeditionOpen}
        characters={roster}
        durations={[...EXPEDITION_DURATIONS]}
        selectedCharacterId={selectedExpeditionCharacterId}
        selectedDurationId={selectedDurationId}
        expeditionActive={Boolean(activeExpedition)}
        onClose={() => setExpeditionOpen(false)}
        onSelectCharacter={setSelectedExpeditionCharacterId}
        onSelectDuration={setSelectedDurationId}
        onStart={handleStartExpedition}
      />
    </div>
  );
}

