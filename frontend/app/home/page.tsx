"use client";

import Image from "next/image";
import dynamic from "next/dynamic";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import FeatureActionTile from "@/components/atoms/home/FeatureActionTile";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AppPageShell from "@/components/AppPageShell";
import { DEFAULT_PROFILE_ICON } from "@/lib/profile-icons";
import Button from "@/components/atoms/Button";
import { CHARACTERS, PLAYER_RESOURCES } from "@/app/characters/characters-data";
import SidebarShell from "@/components/SidebarShell";
import {socket} from "../../socket"

const PvpMatchmakingModal = dynamic(() => import("@/components/organisms/home/PvpMatchmakingModal"), { ssr: false });
const ExpeditionModal = dynamic(() => import("@/components/organisms/home/ExpeditionModal"), { ssr: false });
const MatchmakingModal = dynamic(() => import("@/components/organisms/home/MatchmakingModal"), { ssr: false });
const NotificationToast = dynamic(() => import("@/components/organisms/home/NotificationToast"), { ssr: false });

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
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

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

    const timeoutId = window.setTimeout(() => {
      void getUserData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
      if (!userPseudo || socket.connected) return;

      const timeoutId = window.setTimeout(() => {
        socket.connect();
        socket.emit("login", userPseudo);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
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
      <SidebarShell />

      <main className="relative flex-1 overflow-hidden p-3 pl-0">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#0c0a0f] via-[#12101a] to-[#0a0810]" />
        <div
          className="absolute inset-0 rounded-3xl opacity-[0.02]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-10 flex h-full min-h-0 flex-col gap-5 rounded-3xl border border-[#c9a227]/20 bg-black/10 p-5">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col">
              <span
                className="text-lg font-black uppercase tracking-[0.16em] text-[#f5e6c8]"
                style={{ fontFamily: "var(--font-display), serif" }}
              >
                {pseudo}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#c9b48a]">Welcome back</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#c9a227]/50 bg-gradient-to-br from-[#1e1828] to-[#15121a] px-4 py-2.5 backdrop-blur-sm">
                <span className="inline-flex items-center gap-2.5 text-sm font-bold text-[#f5e6c8]">
                  <i className="fa-solid fa-gem text-lg text-[#ff6b6b]" aria-hidden="true" />
                  <span className="min-w-[48px] text-right">{ruby}</span>
                </span>
              </div>
              <div className="rounded-xl border border-[#c9a227]/50 bg-gradient-to-br from-[#1e1828] to-[#15121a] px-4 py-2.5 backdrop-blur-sm">
                <span className="inline-flex items-center gap-2.5 text-sm font-bold text-[#f5e6c8]">
                  <i className="fa-solid fa-coins text-lg text-[#ffd700]" aria-hidden="true" />
                  <span className="min-w-[48px] text-right">{gold}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Expedition Reward Banner */}
          {expeditionReward && (
            <div className="overflow-hidden rounded-xl border border-[#4b8f65]/60 bg-gradient-to-r from-[#122019] to-[#1a2b23] p-4 shadow-[0_0_20px_rgba(75,143,101,0.15)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-star text-xl text-[#7cfc00]" aria-hidden="true" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-[#7cfc00]">
                      Expedition complete
                    </div>
                    <div className="mt-1 text-sm text-[#dcffe9]">
                      +{expeditionReward.xp} XP • +{expeditionReward.gold} Gold
                    </div>
                  </div>
                </div>
                <Button type="button" size="sm" onClick={handleClaimExpeditionReward} className="font-bold uppercase tracking-wider">
                  Claim
                </Button>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="flex min-h-0 flex-1 flex-col gap-5">
            {/* Features Row */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-4">
              <button
                type="button"
                onClick={handleMine}
                className="mine-clicker group relative flex min-h-[160px] w-full flex-col justify-between overflow-hidden rounded-xl border border-[#c9a227]/40 bg-gradient-to-br from-[#1a1422] to-[#0f0c14] p-4 text-left shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-[#e6c55a]/70 hover:shadow-[0_12px_40px_rgba(201,162,39,0.15)] lg:min-h-[140px]"
              >
                <div className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#c7662d]/15 via-transparent to-[#2a2234]/15 rounded-xl" />
                </div>

                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-2xl font-black uppercase tracking-[0.14em] text-[#f5e6c8]"
                      style={{ fontFamily: "var(--font-display), serif" }}
                    >
                      Forge
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#c9b48a]">Mine Crystals</span>
                  </div>
                  <i className="fa-solid fa-pickaxe text-lg text-[#e6c55a] drop-shadow-lg" aria-hidden="true" />
                </div>

                <div className="relative z-10 flex items-center gap-2.5">
                  <div className="h-px flex-1 bg-gradient-to-r from-[#e6c55a]/60 to-transparent" />
                  <span className="text-xs font-bold uppercase tracking-widest text-[#f0dfb1]">Click to Earn</span>
                </div>
              </button>

              <FeatureActionTile
                title="PvP"
                icon="fa-swords"
                accentClassName="bg-gradient-to-br from-[#4d2f57]/20 via-[#b15b45]/15 to-transparent"
                value="Queue"
                onClick={handleStartPvp}
              />

              <FeatureActionTile
                title="Expedition"
                icon="fa-compass"
                accentClassName="bg-gradient-to-br from-[#355366]/20 via-[#7a9162]/15 to-transparent"
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

            {/* Team Builder Section */}
            <div className="flex-1 overflow-hidden rounded-xl border border-[#c9a227]/25 bg-gradient-to-br from-[#120f17]/80 to-[#0f0c14]/60 p-5 backdrop-blur-xs">
              <div className="mb-4 flex items-center justify-between border-b border-[#c9a227]/20 pb-4">
                <div className="flex flex-col gap-1">
                  <h2
                    className="text-lg font-black uppercase tracking-[0.14em] text-[#f5e6c8]"
                    style={{ fontFamily: "var(--font-display), serif" }}
                  >
                    Your Squad
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#c9b48a]">Assemble your champions</p>
                </div>
                <span className="rounded-lg border border-[#c9a227]/60 bg-gradient-to-r from-[#1e1828] to-[#15121a] px-3 py-1.5 text-xs font-black uppercase tracking-widest text-[#e6c55a]">
                  {teamPowerLabel}
                </span>
              </div>

              <div className="space-y-4">
                {/* Active Team */}
                <div className="rounded-lg border border-[#c9a227]/25 bg-[#0a0810]/50 p-4">
                  <div className="mb-3 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9b48a]">
                      ⚔️ Active Team
                    </div>
                  </div>
                  <div className="flex justify-center gap-3">
                    {teamSlots.map((slotCharacterId, index) => {
                      const selectedCharacter = getTeamCharacter(slotCharacterId);
                      const isSlotHovered = hoveredSlotIndex === index;
                      return (
                        <div
                          key={`home-team-slot-${index}`}
                          ref={(element) => {
                            slotRefs.current[index] = element;
                          }}
                          className={`group team-slot-item relative w-[110px] overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                            isSlotHovered ? "border-[#c9a227] shadow-[0_0_16px_rgba(201,162,39,0.5)]" : "border-[#6b5a84]/70"
                          } ${selectedCharacter ? "bg-[#0f0c14]" : "bg-[#120f17]/50"}`}
                        >
                          {selectedCharacter ? (
                            <>
                              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0a0810]">
                                <Image src={selectedCharacter.portrait} alt={selectedCharacter.name} fill className="object-cover transition-transform group-hover:scale-110" />
                              </div>
                              <div className="flex items-center justify-between bg-gradient-to-r from-[#1a1422] to-[#0f0c14] px-2 py-1.5">
                                <span className="truncate text-[8px] font-bold uppercase tracking-wider text-[#ead9aa]">
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
                                  className="text-xs text-[#e6c55a] transition-colors hover:text-[#ffcf63]"
                                  aria-label={`Clear slot ${index + 1}`}
                                >
                                  ✕
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex aspect-[3/4] w-full items-center justify-center bg-gradient-to-br from-[#1e1a24] to-[#0f0c14] text-center">
                              <div className="flex flex-col items-center gap-1.5">
                                <i className="fa-solid fa-plus text-lg text-[#6b5a84]" aria-hidden="true" />
                                <div className="text-[8px] font-bold uppercase tracking-wider text-[#7b6d93]">
                                  Slot<br />{index + 1}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Roster Selection */}
                <div className="rounded-lg border border-[#c9a227]/25 bg-[#0a0810]/50 p-4">
                  <div className="mb-4 text-center">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#c9b48a]">
                      📜 Available Champions
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {roster.map((character, index) => {
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
                          className={`group team-slot-item w-[90px] overflow-hidden rounded-lg border-2 text-left transition-all duration-200 ${
                            inTeam
                              ? "border-[#c9a227] shadow-[0_0_12px_rgba(201,162,39,0.4)]"
                              : "border-[#433556]/60 hover:border-[#7a6599]/80"
                          } ${dragPreview?.id === character.id ? "opacity-40" : ""}`}
                        >
                          <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0a0810]">
                            <Image src={character.portrait} alt={character.name} fill className="object-cover transition-transform group-hover:scale-110" draggable={false} />
                          </div>
                          <div className="truncate bg-gradient-to-r from-[#1a1422] to-[#0f0c14] px-1.5 py-1 text-[7px] font-bold uppercase tracking-wider text-[#ead9aa]">
                            {character.name}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
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

