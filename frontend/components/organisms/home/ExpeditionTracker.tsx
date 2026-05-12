"use client";

import Image from "next/image";
import { type CSSProperties } from "react";
import Button from "@/components/atoms/Button";

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

type Character = {
  id: string;
  name: string;
  portrait: string;
};

type ExpeditionTrackerProps = {
  activeExpedition: ActiveExpedition | null;
  expeditionReward: ExpeditionReward | null;
  nowTs: number;
  activeExpeditionCharacter: Character | null;
  expeditionProgressPercent: number;
  expeditionRemainingSeconds: number;
  expeditionLabel: string;
  onClaimReward: () => void;
  onOpenExpedition: () => void;
};

const formatTimer = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export function ExpeditionTracker({
  activeExpedition,
  expeditionReward,
  nowTs,
  activeExpeditionCharacter,
  expeditionProgressPercent,
  expeditionRemainingSeconds,
  expeditionLabel,
  onClaimReward,
  onOpenExpedition,
}: ExpeditionTrackerProps) {
  return (
    <>
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
            <Button
              type="button"
              size="sm"
              onClick={onClaimReward}
              className="font-bold uppercase tracking-wider"
            >
              Claim
            </Button>
          </div>
        </div>
      )}

      {/* Expedition Card */}
      <button
        type="button"
        onClick={onOpenExpedition}
        className="group relative flex h-full min-h-[160px] w-full flex-col justify-between overflow-hidden rounded-xl border border-[#c9a227]/40 bg-gradient-to-br from-[#1a1422] to-[#0f0c14] p-4 text-left shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:border-[#e6c55a]/70 hover:shadow-[0_12px_40px_rgba(201,162,39,0.15)] lg:min-h-[140px]"
      >
        <div className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-br from-[#355366]/15 via-transparent to-[#7a9162]/15 rounded-xl" />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-black uppercase tracking-[0.14em] text-[#f5e6c8]" style={{ fontFamily: "var(--font-display), serif" }}>
              Expedition
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#c9b48a]">
              Send your champions
            </span>
          </div>
          <i className="fa-solid fa-compass text-lg text-[#e6c55a] drop-shadow-lg" aria-hidden="true" />
        </div>

        {activeExpeditionCharacter && (
          <div className="relative z-10 mt-3">
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
        )}

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="h-px flex-1 bg-gradient-to-r from-[#e6c55a]/60 to-transparent" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#f0dfb1]">{expeditionLabel}</span>
        </div>
      </button>
    </>
  );
}
