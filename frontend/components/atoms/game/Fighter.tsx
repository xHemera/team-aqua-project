"use client";

import Image from "next/image";
import { CHARACTERS } from "@/public/gameResources/heroes";

type FighterProps = {
  character: (typeof CHARACTERS)[number];
  own: boolean;
};

export default function Fighter({ character, own }: FighterProps) {
  const chibi = character.identity.assets.chibi;
  const maxHealth = character.baseStats.hp;
  const currentHealth = maxHealth;
  const healthPercent = (currentHealth / maxHealth) * 100;

  const chibiGlowClass = own
    ? "drop-shadow-[0_0_3px_rgba(96,211,148,0.9)]"
    : "drop-shadow-[0_10px_18px_rgba(0,0,0,0.45)]";

  return (
    <>
      <div className="flex w-full flex-col items-center gap-1">
        <div
          className={`relative flex aspect-square w-full items-center justify-center overflow-hidden ${
            own ? "fighter-float" : ""
          }`}
        >
          <Image
            src={chibi}
            alt={`Chibi de ${character.identity.name}`}
            fill
            className={`object-contain p-3 transition-[filter] duration-200 ${chibiGlowClass}`}
            sizes="(max-width: 768px) 160px, 240px"
            unoptimized
          />
        </div>

        <p className="text-center text-sm font-semibold leading-tight text-[#f5e6c8]">
          {character.identity.name}
        </p>

        <div className="relative w-[88%] max-w-[11rem] pt-1">
          <div className="relative h-5 overflow-hidden rounded-full border border-[#99CDB0] bg-[#211d2f]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#60D394] via-[#2F8957] to-[#AAF683]"
              style={{ width: `${healthPercent}%` }}
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 px-2 text-[11px] font-semibold leading-none text-[#f5e6c8] shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
              <span className="whitespace-nowrap">{currentHealth}/{maxHealth}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .fighter-float {
          animation: fighterFloat 2.2s ease-in-out infinite;
          will-change: transform;
        }

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
