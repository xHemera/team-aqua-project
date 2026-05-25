"use client";

import Image from "next/image";
import { CHARACTERS } from "@/public/gameResources/heroes";

type StatusEffect = {
  type: "buff" | "debuff" | "dot" | "cc";
  label: string;
  turns?: number;
};

type EnemyFighterProps = {
  character: (typeof CHARACTERS)[number];
  currentHp?: number;
  effects?: StatusEffect[];
  active?: boolean;
};

const effectStyles: Record<
  StatusEffect["type"],
  { border: string; glow: string; label: string }
> = {
  buff: {
    border: "border-[#c9a84c]",
    glow: "shadow-[0_0_6px_rgba(201,168,76,0.3)]",
    label: "bg-[#c9a84c]",
  },
  debuff: {
    border: "border-[#8f3a5a]",
    glow: "shadow-[0_0_6px_rgba(143,58,90,0.3)]",
    label: "bg-[#8f3a5a]",
  },
  dot: {
    border: "border-[#4a8a4a]",
    glow: "shadow-[0_0_6px_rgba(74,138,74,0.3)]",
    label: "bg-[#4a8a4a]",
  },
  cc: {
    border: "border-[#5a6a8a]",
    glow: "shadow-[0_0_6px_rgba(90,106,138,0.3)]",
    label: "bg-[#5a6a8a]",
  },
};

export default function EnemyFighter({
  character,
  currentHp,
  effects,
  active = false,
}: EnemyFighterProps) {
  const chibi = character.identity.assets.chibi;
  const maxHealth = character.baseStats.hp;
  const hp = currentHp ?? maxHealth;
  const healthPercent = (hp / maxHealth) * 100;

  return (
    <>
      <div className="flex w-full flex-col items-center gap-1">
        {/* health bar — dark medieval stone */}
        <div className="relative w-[88%] max-w-[11rem] pt-1">
          <div className="relative overflow-hidden rounded border border-[#2a1f14] bg-gradient-to-b from-[#14100a] to-[#0f0a06] shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]">
            <div className="m-[2px] overflow-hidden rounded-[2px] border border-[#3a2020] bg-[#1a0a0a]">
              <div
                className="h-4 bg-gradient-to-r from-[#6a1a1a] via-[#8a2a2a] to-[#5a1a1a] transition-all duration-300 ease-out"
                style={{ width: `${healthPercent}%` }}
              >
                <div className="h-full bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_60%)]" />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="font-serif text-[10px] font-semibold tracking-wide text-[#c9b896] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {hp}/{maxHealth}
              </span>
            </div>
          </div>

          {/* corner flourishes — darker gold */}
          <div className="pointer-events-none absolute -left-[1px] -top-[1px] h-2 w-2 border-l-2 border-t-2 border-[#c9a84c]/20" />
          <div className="pointer-events-none absolute -right-[1px] -top-[1px] h-2 w-2 border-r-2 border-t-2 border-[#c9a84c]/20" />
          <div className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-2 w-2 border-b-2 border-l-2 border-[#c9a84c]/20" />
          <div className="pointer-events-none absolute -bottom-[1px] -right-[1px] h-2 w-2 border-b-2 border-r-2 border-[#c9a84c]/20" />
        </div>

        {/* status effects */}
        {effects && effects.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-1">
            {effects.map((effect, i) => {
              const s = effectStyles[effect.type];
              return (
                <div
                  key={i}
                  className={`group relative flex h-[22px] w-[22px] items-center justify-center rounded-[3px] border ${s.border} ${s.glow} bg-[#14100a]`}
                  title={
                    effect.turns
                      ? `${effect.label} (${effect.turns} turns)`
                      : effect.label
                  }
                >
                  <span className={`h-2 w-2 rotate-45 ${s.label}`} />
                </div>
              );
            })}
          </div>
        ) : null}

        {/* name */}
        <p className="font-serif text-center text-sm font-semibold leading-tight tracking-wide text-[#c9b896]">
          {character.identity.name}
        </p>

        {/* chibi */}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl">
          <Image
            src={chibi}
            alt={`Chibi de ${character.identity.name}`}
            fill
            className={`object-contain p-3 transition-all duration-200 ${
              active
                ? "drop-shadow-[0_0_6px_rgba(232,88,106,0.9)]"
                : "drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
            }`}
            style={
              active
                ? { animation: "enemyFloat 1s ease-in-out infinite" }
                : undefined
            }
            sizes="(max-width: 768px) 160px, 240px"
            unoptimized
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes enemyFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </>
  );
}
