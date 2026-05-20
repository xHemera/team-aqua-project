"use client";

import Image from "next/image";
import { CHARACTERS } from "@/public/gameResources/heroes";

type EnemyFighterProps = {
  character: (typeof CHARACTERS)[number];
};

export default function EnemyFighter({ character }: EnemyFighterProps) {
  const chibi = character.identity.assets.chibi;
  const maxHealth = character.baseStats.hp;
  const currentHealth = maxHealth;
  const healthPercent = (currentHealth / maxHealth) * 100;

  return (
    <>
      <div className="flex w-full flex-col items-center gap-1">
        <div className="relative w-[88%] max-w-[11rem] pt-1">
          <div className="relative h-5 overflow-hidden rounded-full border border-[#b85c5c] bg-[#341515]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8f1f1f] via-[#c93b3b] to-[#ff6b6b]"
              style={{ width: `${healthPercent}%` }}
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 px-2 text-[11px] font-semibold leading-none text-[#f5e6c8] shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
              <span className="whitespace-nowrap">
                {currentHealth}/{maxHealth}
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-sm font-semibold leading-tight text-[#f5e6c8]">
          {character.identity.name}
        </p>

        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden">
          <Image
            src={chibi}
            alt={`Chibi de ${character.identity.name}`}
            fill
            className="object-contain p-3 transition-[filter] duration-200 drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]"
            sizes="(max-width: 768px) 160px, 240px"
            unoptimized
          />
        </div>
      </div>
    </>
  );
}
