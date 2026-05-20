"use client";

import { useState } from "react";
import Image from "next/image";
import SpellButton from "@/components/atoms/game/SpellButton";

type Spell = {
  id: string;
  manaCost: number;
  info: {
    name: string;
    icon: string;
    description: string;
  };
};

type Hero = {
  identity: {
    id: string;
    name: string;
  };
  skills: Spell[];
};

type DisplaySpell = Spell | {
  id: string;
  manaCost: number;
  info: {
    name: string;
    icon: string;
    description: string;
  };
};

type SpellSelectorProps = {
  hero: Hero;
  className?: string;
};

const manaIcon = "/gameResources/items/Item_Tear_of_Phagousa.webp";
const basicAttackIcon = "/gameResources/spells/attack_boost.png";

const basicAttack: DisplaySpell = {
  id: "basic-attack",
  manaCost: 0,
  info: {
    name: "Basic Attack",
    icon: basicAttackIcon,
    description: "A simple attack that deals damage based on the hero's stats.",
  },
};

export default function SpellSelector({ hero, className }: SpellSelectorProps) {
  const [hoveredSpell, setHoveredSpell] = useState<Spell | null>(null);
  const spells: DisplaySpell[] = [basicAttack, ...hero.skills];

  return (
    <div className={`mx-auto min-h-0 w-full p-0 sm:p-4 ${className ?? ""}`}>
      <div onMouseLeave={() => setHoveredSpell(null)}>
        <div className="mb-2 hidden min-h-[84px] sm:mb-3 sm:block">
          {hoveredSpell ? (
            <div className="rounded-lg border border-[#3c3650] bg-[#0f0e13] p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="min-w-0 flex-1 truncate text-lg font-semibold sm:text-xl">{hoveredSpell.info.name}</p>
                <div
                  className={`flex shrink-0 items-center gap-2 rounded-xl bg-[#288FF6] px-2 py-1 ${
                    hoveredSpell.manaCost > 0 ? "" : "invisible"
                  }`}
                >
                  <Image src={manaIcon} alt="Mana" width={20} height={20} />
                  <span className="text-lg font-semibold">{hoveredSpell.manaCost}</span>
                </div>
              </div>
              <p className="mt-1 text-base leading-relaxed text-[#e7dbc1]">{hoveredSpell.info.description}</p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-4">
          {spells.slice(0, 4).map((spell) => (
            <SpellButton
              key={spell.id}
              name={spell.info.name}
              icon={spell.info.icon}
              onMouseEnter={() => setHoveredSpell(spell)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}