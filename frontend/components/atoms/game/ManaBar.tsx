"use client";

import Image from "next/image";

type ManaBarProps = {
  currentMana: number;
  className?: string;
};

const MANA_MAX = 100;
const manaIcon = "/gameResources/items/mana.webp";

export default function ManaBar({ currentMana, className = "" }: ManaBarProps) {
  const manaPercent = Math.max(0, Math.min(100, (currentMana / MANA_MAX) * 100));
  const clampedMana = Math.round(Math.max(0, Math.min(MANA_MAX, currentMana)));

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      <div className="relative flex flex-col items-center">
        {/* frame */}
        <div className="relative flex h-48 w-7 items-end overflow-hidden rounded-full border-2 border-[#2a2d42] bg-[#0c0d14] shadow-[inset_0_0_12px_rgba(0,0,0,0.6),0_0_8px_rgba(107,111,158,0.15)]">
          {/* liquid fill */}
          <div
            className="absolute bottom-0 w-full transition-all duration-300 ease-out"
            style={{
              height: `${manaPercent}%`,
              background:
                "linear-gradient(to top, #4a5fd4 0%, #6b80f0 50%, #a4b5ff 100%)",
              boxShadow:
                "inset 0 0 10px rgba(164,181,255,0.25), 0 0 14px rgba(91,110,232,0.2)",
            }}
          >
            {/* shine overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_30%,rgba(255,255,255,0)_100%)]" />
          </div>

          {/* value */}
          <span
            className="absolute inset-0 z-10 flex items-center justify-center text-[10px] font-bold text-white"
            style={{
              textShadow: "0 0 6px rgba(164,181,255,0.6), 0 0 12px rgba(91,110,232,0.3)",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            {clampedMana}
          </span>
        </div>

        {/* mana icon */}
        <div className="mt-1.5">
          <Image src={manaIcon} alt="Mana" width={18} height={18} className="opacity-70" unoptimized />
        </div>
      </div>
    </div>
  );
}
