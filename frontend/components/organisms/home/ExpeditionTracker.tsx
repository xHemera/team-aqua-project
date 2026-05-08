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
      <div className="rounded-xl border border-[#c9a227]/40 bg-gradient-to-br from-[#1a1422] to-[#0f0c14] p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.14em] text-[#f5e6c8]" style={{ fontFamily: "var(--font-display), serif" }}>
              Expedition
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#c9b48a]">
              Send your champions
            </div>
          </div>
          <button
            onClick={onOpenExpedition}
            className="rounded-lg border border-[#c9a227]/50 bg-gradient-to-r from-[#1e1828] to-[#15121a] px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6c55a] hover:border-[#c9a227]/80"
          >
            {expeditionLabel}
          </button>
        </div>

        {activeExpeditionCharacter && (
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
        )}
      </div>
    </>
  );
}
