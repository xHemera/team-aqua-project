import Image from "next/image";
import type { CharacterData } from "./types";

type CharacterDisplayPanelProps = {
  selectedCharacter: CharacterData;
  characterRoleTitle: string;
  characterRoleColor: string;
  powerLabel: string;
};

// Organism: panneau central avec hero art et metadonnees principales.
export default function CharacterDisplayPanel({
  selectedCharacter,
  characterRoleTitle,
  characterRoleColor,
  powerLabel,
}: CharacterDisplayPanelProps) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${characterRoleColor}, transparent 60%)`,
        }}
      />

      <div className="absolute left-6 top-6 z-10">
        <div className="flex flex-col gap-2">
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c9a227]"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {characterRoleTitle}
          </span>
          <h1
            className="text-5xl font-black text-[#f5e6c8]"
            style={{
              fontFamily: "var(--font-display), serif",
              textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 40px rgba(201,162,39,0.3)",
            }}
          >
            {selectedCharacter.name}
          </h1>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#c9a227] bg-gradient-to-br from-[#c9a227] to-[#8b6914] text-sm font-bold text-[#1a1510] shadow-lg"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            {selectedCharacter.level}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 overflow-hidden rounded-full border border-[#c9a227]/30 bg-black/50">
              <div
                className="h-full bg-gradient-to-r from-[#c9a227] to-[#f4e4a6]"
                style={{ width: `${selectedCharacter.xpPercent}%` }}
              />
            </div>
            <span className="text-xs text-[#8a7a5a]">{selectedCharacter.xpPercent}%</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#c9a227]/30 bg-black/40 px-4 py-2 backdrop-blur-sm">
          <i className="fa-solid fa-gem text-[#c9a227]" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#8a7a5a]">Power Rating</div>
            <div
              className="text-xl font-bold text-[#f5e6c8]"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              {powerLabel}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="relative h-[130%] w-full">
          <Image
            src={selectedCharacter.body}
            alt={selectedCharacter.name}
            fill
            className="object-contain object-center"
            priority
          />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0c0a0f] via-[#0c0a0f]/80 to-transparent" />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <div
          className="text-5xl font-black uppercase tracking-[0.3em] text-[#f5e6c8]/[0.04]"
          style={{
            textShadow: `0 0 60px ${characterRoleColor}10`,
            fontFamily: "var(--font-display), serif",
          }}
        >
          {selectedCharacter.name}
        </div>
      </div>
    </div>
  );
}
