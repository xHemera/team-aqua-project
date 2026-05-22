"use client";

import Image from "next/image";
import { CHARACTERS } from "@/public/gameResources/heroes";

type FighterProps = {
  character: (typeof CHARACTERS)[number];
  active?: boolean;
};

export default function Fighter({ character, active = false }: FighterProps) {
  const chibi = character.identity.assets.chibi;
  const maxHealth = character.baseStats.hp;
  const currentHealth = maxHealth;
  const healthPercent = (currentHealth / maxHealth) * 100;
  const healthBarClassName = "border-[#99CDB0] bg-[#211d2f]";
  const healthFillClassName = "bg-gradient-to-r from-[#60D394] via-[#2F8957] to-[#AAF683]";

  const chibiGlowClass = active
    ? "drop-shadow-[0_0_3px_rgba(96,211,148,0.9)]"
    : "drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]";

  const healthBar = (
    <div className="relative w-[88%] max-w-[11rem] pt-1">
      <div className={`relative h-5 overflow-hidden rounded-full border ${healthBarClassName}`}>
        <div
          className={`h-full rounded-full ${healthFillClassName}`}
          style={{ width: `${healthPercent}%` }}
        />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 px-2 text-[11px] font-semibold leading-none text-[#f5e6c8] shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
          <span className="whitespace-nowrap">{currentHealth}/{maxHealth}</span>
        </div>
      </div>
    </div>
  );

  const fighterChibi = (
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
  );

  return (
    <>
      <div className="flex w-full flex-col items-center gap-1">
        {fighterChibi}
        <p className="text-center text-sm font-semibold leading-tight text-[#f5e6c8]">
          {character.identity.name}
        </p>
        {healthBar}
      </div>

      <style jsx>{`
        @keyframes fighterFloat {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </>
  );
}
