"use client";

import Image from "next/image";
import { CHARACTERS } from "@/public/gameResources/heroes";

type TurnQueueItem = {
  id: string;
};

const TURN_ORDER: TurnQueueItem[] = [
  { id: "archer" },
  { id: "mage" },
  { id: "knight" },
  { id: "assassin" },
];

export default function TurnQueue() {
  const visibleTurns = TURN_ORDER
    .map((turn) => {
      const character = CHARACTERS.find((entry) => entry.identity.id === turn.id);

      return character ? { ...turn, character } : null;
    })
    .filter((turn): turn is TurnQueueItem & { character: (typeof CHARACTERS)[number] } => Boolean(turn));

  return (
    <div className="fixed left-4 top-4 z-30">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#d8c89e]">
        Queue :
      </p>

      <div className="flex flex-col gap-2">
        {visibleTurns.map((turn, index) => {
          const isFirst = index === 0;

          return (
            <div key={turn.id} className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image
                src={turn.character.identity.assets.portrait}
                alt={`${turn.character.identity.name}`}
                fill
                className="object-cover"
                sizes="44px"
                unoptimized
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}