"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

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
      {/* top gem */}
      <div className="mb-1 h-3 w-3 rotate-45 rounded-[1px] border border-[#6b6f9e] bg-[#383d6b] shadow-[0_0_6px_rgba(107,111,158,0.3)]" />

      <div className="relative flex flex-col items-center gap-2">
        {/* frame */}
        <div className="relative flex h-48 w-7 items-end overflow-hidden rounded-sm border-2 border-[#2a2d42] bg-[#0c0d14] shadow-[inset_0_0_12px_rgba(0,0,0,0.6),0_0_8px_rgba(107,111,158,0.15)]">
          {/* liquid fill */}
          <div
            className="absolute bottom-0 w-full transition-all duration-300 ease-out"
            style={{
              height: `${manaPercent}%`,
              background:
                "linear-gradient(to top, #5b6ee8 0%, #7b8ef5 40%, #a4b5ff 70%, #c8d4ff 100%)",
              boxShadow:
                "inset 0 0 12px rgba(164,181,255,0.3), 0 0 16px rgba(91,110,232,0.25)",
            }}
          >
            {/* shine overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0)_0%,rgba(255,255,255,0.12)_30%,rgba(255,255,255,0)_100%)]" />

            {/* animated shimmer */}
            <div className="absolute inset-0 animate-mana-shimmer bg-[linear-gradient(-45deg,transparent_30%,rgba(255,255,255,0.15)_50%,transparent_70%)]" />
          </div>

          {/* border lines decoration */}
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[1px] bg-[#2a2d42] opacity-50" />
          <div className="pointer-events-none absolute inset-x-0 top-1/4 h-[1px] bg-[#2a2d42] opacity-30" />
          <div className="pointer-events-none absolute inset-x-0 top-3/4 h-[1px] bg-[#2a2d42] opacity-30" />

          {/* value inside bar */}
          <span
            className="absolute inset-0 z-10 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.1em] text-white drop-shadow-[0_0_6px_rgba(164,181,255,0.6)]"
            style={{
              textShadow: "0 0 8px rgba(164,181,255,0.5), 0 0 16px rgba(91,110,232,0.3)",
              writingMode: "vertical-rl",
              textOrientation: "mixed",
            }}
          >
            {clampedMana}
          </span>

          {/* floating particles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute h-[2px] w-[2px] rounded-full bg-[#c8d4ff] opacity-60"
                style={{
                  left: `${30 + i * 25}%`,
                  bottom: `${manaPercent * (0.2 + i * 0.25)}%`,
                  animation: `mana-particle-${i} 2.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* icon */}
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2a2d42] bg-[#0c0d14] shadow-[0_0_6px_rgba(107,111,158,0.2)]">
          <Image src={manaIcon} alt="Mana" width={14} height={14} className="opacity-80" unoptimized />
        </div>
      </div>

      {/* bottom gem */}
      <div className="mt-1 h-2 w-2 rotate-45 rounded-[1px] border border-[#6b6f9e] bg-[#383d6b] shadow-[0_0_6px_rgba(107,111,158,0.3)]" />

      <style jsx>{`
        @keyframes mana-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes mana-particle-0 {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.5); opacity: 0; }
        }
        @keyframes mana-particle-1 {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
          50% { transform: translateY(-16px) scale(1.3); opacity: 0; }
        }
        @keyframes mana-particle-2 {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-24px) scale(1.6); opacity: 0; }
        }

        .animate-mana-shimmer {
          animation: mana-shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
