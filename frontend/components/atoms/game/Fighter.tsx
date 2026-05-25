"use client";

import Image from "next/image";
import { CHARACTERS } from "@/public/gameResources/heroes";

type StatusEffect = {
  type: "buff" | "debuff" | "dot" | "cc";
  label: string;
  turns?: number;
};

type FighterProps = {
  character: (typeof CHARACTERS)[number];
  active?: boolean;
  currentHp?: number;
  currentMp?: number;
  effects?: StatusEffect[];
};

const effectStyles: Record<StatusEffect["type"], { border: string; glow: string; label: string }> = {
  buff:   { border: "border-[#c9a84c]", glow: "shadow-[0_0_6px_rgba(201,168,76,0.3)]", label: "bg-[#c9a84c]" },
  debuff: { border: "border-[#8f3a5a]", glow: "shadow-[0_0_6px_rgba(143,58,90,0.3)]", label: "bg-[#8f3a5a]" },
  dot:    { border: "border-[#4a8a4a]", glow: "shadow-[0_0_6px_rgba(74,138,74,0.3)]", label: "bg-[#4a8a4a]" },
  cc:     { border: "border-[#5a6a8a]", glow: "shadow-[0_0_6px_rgba(90,106,138,0.3)]", label: "bg-[#5a6a8a]" },
};

export default function Fighter({ character, active = false, currentHp, currentMp, effects }: FighterProps) {
  const chibi = character.identity.assets.chibi;
  const maxHealth = character.baseStats.hp;
  const hp = currentHp ?? maxHealth;
  const healthPercent = (hp / maxHealth) * 100;

  const chibiGlowClass = active
    ? "drop-shadow-[0_0_3px_rgba(96,211,148,0.9)]"
    : "drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]";

  return (
    <>
      <div className="flex w-full flex-col items-center gap-1">
        {/* chibi */}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden">
          <Image
            src={chibi}
            alt={`Chibi de ${character.identity.name}`}
            fill
            className={`object-contain p-3 transition-[filter] duration-200 ${chibiGlowClass}`}
            style={active ? { animation: "fighterFloat 1s ease-in-out infinite", transformOrigin: "center bottom" } : undefined}
            sizes="(max-width: 768px) 160px, 240px"
            unoptimized
          />
        </div>

        {/* name */}
        <p className="font-serif text-center text-sm font-semibold leading-tight tracking-wide text-[#c9b896]">
          {character.identity.name}
        </p>

        {/* health bar — medieval stone */}
        <div className="relative w-[88%] max-w-[11rem] pt-1">
          <div className="relative overflow-hidden rounded border border-[#2a1f14] bg-gradient-to-b from-[#14100a] to-[#0f0a06] shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]">
            {/* bar frame */}
            <div className="m-[2px] overflow-hidden rounded-[2px] border border-[#4a3a28] bg-[#1a1410]">
              {/* fill */}
              <div
                className="h-4 bg-gradient-to-r from-[#5a8a6a] via-[#7aaa6a] to-[#4a9a6a] transition-all duration-300 ease-out"
                style={{ width: `${healthPercent}%` }}
              >
                <div className="h-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_60%)]" />
              </div>
            </div>

            {/* HP text */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-[10px] font-semibold tracking-wide text-[#c9b896] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {hp}/{maxHealth}
              </span>
            </div>
          </div>

          {/* corner flourishes */}
          <div className="pointer-events-none absolute -left-[1px] -top-[1px] h-2 w-2 border-l-2 border-t-2 border-[#c9a84c]/30" />
          <div className="pointer-events-none absolute -right-[1px] -top-[1px] h-2 w-2 border-r-2 border-t-2 border-[#c9a84c]/30" />
          <div className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-2 w-2 border-b-2 border-l-2 border-[#c9a84c]/30" />
          <div className="pointer-events-none absolute -bottom-[1px] -right-[1px] h-2 w-2 border-b-2 border-r-2 border-[#c9a84c]/30" />
        </div>

        {/* status effects */}
        {effects && effects.length > 0 ? (
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {effects.map((effect, i) => {
              const s = effectStyles[effect.type];
              return (
                <div
                  key={i}
                  className={`group relative flex h-[22px] w-[22px] items-center justify-center rounded-[3px] border ${s.border} ${s.glow} bg-[#14100a]`}
                  title={effect.turns ? `${effect.label} (${effect.turns} turns)` : effect.label}
                >
                  <span className={`h-2 w-2 rotate-45 ${s.label}`} />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes fighterFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}
