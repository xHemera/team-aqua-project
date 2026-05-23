"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CharacterData } from "@/components/organisms/characters/types";
import SpellButton from "@/components/atoms/game/SpellButton";
import type { SpellDescriptionSegment } from "@/lib/spell-description";
import { resolveSpellDescriptionSegments } from "@/lib/spell-description";
import { CHARACTERS } from "@/public/gameResources/heroes";

type HeroDefinition = (typeof CHARACTERS)[number];
type HeroSkill = HeroDefinition["skills"][number];

type ResolvedSpellPreview = {
  id: string;
  name: string;
  icon: string;
  manaCost: number;
  level: number;
  segments: SpellDescriptionSegment[];
  isMaxLevel: boolean;
};

type SpellSelectorProps = {
  hero: HeroDefinition;
  character: CharacterData | null;
  className?: string;
};

const manaIcon = "/gameResources/items/mana.webp";

const basicAttackIcon = "/gameResources/spells/attack_boost.png";

const formatNumber = (value: number) => {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  return (Math.round(value * 10) / 10).toString();
};

const getSkillLevel = (character: CharacterData | null, skill: HeroSkill, index: number) => {
  const byId = character?.skills.find((candidate) => candidate.id === skill.id)?.level;
  if (typeof byId === "number") {
    return byId;
  }

  const byName = character?.skills.find((candidate) => candidate.name === skill.info.name)?.level;
  if (typeof byName === "number") {
    return byName;
  }

  const byIndex = character?.skills[index]?.level;
  return byIndex ?? 1;
};

const getScalingRow = (skill: HeroSkill, level: number) => {
  const safeIndex = Math.min(Math.max(level - 1, 0), skill.scaling.length - 1);
  return skill.scaling[safeIndex] ?? skill.scaling[0] ?? [];
};

const buildContext = (stats: CharacterData["stats"], skillLevel: number, scalingRow: number[]) => {
  const context: Record<string, number> = {
    level: skillLevel,
    skilllevel: skillLevel,
    spelllevel: skillLevel,
    skill_level: skillLevel,
    physicaldamage: stats.physicalDamage,
    magicaldamage: stats.magicalDamage,
    critchance: stats.critChance,
    critdamage: stats.critDamage,
    hp: stats.hp,
    mp: stats.mp,
    physicalresistance: stats.physicalResistance,
    magicalresistance: stats.magicalResistance,
    speed: stats.speed,
  };

  scalingRow.forEach((value, index) => {
    context[`value${index + 1}`] = value;
    context[`v${index + 1}`] = value;
  });

  return context;
};

const evaluateExpression = (expression: string, context: Record<string, number>) => {
  try {
    const normalized = expression
      .replace(/\bskill\s*level\b/gi, "skillLevel")
      .replace(/\bspell\s*level\b/gi, "spellLevel")
      .replace(/\bphysical\s*damage\b/gi, "physicalDamage")
      .replace(/\bmagical\s*damage\b/gi, "magicalDamage")
      .replace(/\bphysical\s*resistance\b/gi, "physicalResistance")
      .replace(/\bmagical\s*resistance\b/gi, "magicalResistance")
      .replace(/\bcrit\s*chance\b/gi, "critChance")
      .replace(/\bcrit\s*damage\b/gi, "critDamage")
      .replace(/\blevel\b/gi, "level")
      .replace(/\b([a-z_][a-z0-9_]*)\b/gi, (match) => {
        const key = match.toLowerCase();
        return key in context ? `context.${key}` : match;
      });

    const result = new Function("context", `"use strict"; return (${normalized});`)(context);

    return typeof result === "number" && Number.isFinite(result) ? result : null;
  } catch {
    return null;
  }
};

const resolveToken = (
  token: string,
  tokenIndex: number,
  scalingRow: number[],
  stats: CharacterData["stats"],
  skillLevel: number,
) => {
  const normalizedToken = token.trim().toLowerCase();
  const context = buildContext(stats, skillLevel, scalingRow);

  if (normalizedToken in context) {
    return context[normalizedToken];
  }

  if (typeof scalingRow[tokenIndex] === "number") {
    const rawValue = scalingRow[tokenIndex];

    if (normalizedToken === "multiplier" || normalizedToken === "flat") {
      return rawValue;
    }

    const directExpression = evaluateExpression(token, context);
    if (directExpression !== null) {
      return directExpression;
    }

    return rawValue;
  }

  return null;
};

const resolveSpellPreview = (
  hero: HeroDefinition,
  skill: HeroSkill,
  character: CharacterData | null,
  index: number,
): ResolvedSpellPreview => {
  const level = getSkillLevel(character, skill, index);
  const stats = character?.stats ?? hero.baseStats;
  const scalingRow = getScalingRow(skill, level);
  const segments = resolveSpellDescriptionSegments(skill.info.description, ({ token, tokenIndex }) => {
    const resolved = resolveToken(token, tokenIndex, scalingRow, stats, level);
    return resolved !== null ? formatNumber(resolved) : null;
  });

  return {
    id: skill.id,
    name: skill.info.name,
    icon: skill.info.icon,
    manaCost: skill.manaCost,
    level,
    segments,
    isMaxLevel: level >= skill.scaling.length,
  };
};

const resolveBasicAttackPreview = (hero: HeroDefinition, character: CharacterData | null): ResolvedSpellPreview => {
  return {
    id: "basic-attack",
    name: "Basic Attack",
    icon: basicAttackIcon,
    manaCost: 0,
    level: 1,
    segments: [{ text: "A simple attack that deals damage based on the hero's stats." }],
    isMaxLevel: true,
  };
};

export default function SpellSelector({ hero, character, className }: SpellSelectorProps) {
  const [hoveredSpellId, setHoveredSpellId] = useState<string | null>(null);

  const spells = useMemo(() => {
    const resolved = hero.skills.map((skill, index) => resolveSpellPreview(hero, skill, character, index));

    return [resolveBasicAttackPreview(hero, character), ...resolved];
  }, [character, hero]);

  const hoveredSpell = spells.find((spell) => spell.id === hoveredSpellId) ?? null;

  return (
    <div className={`mx-auto min-h-0 w-full p-0 sm:p-4 ${className ?? ""}`}>
      <div onMouseLeave={() => setHoveredSpellId(null)}>
        <div className="mb-2 hidden min-h-[84px] sm:mb-3 sm:block">
          {hoveredSpell ? (
            <div className="rounded-lg border border-[#3c3650] bg-[#0f0e13] p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <p className="min-w-0 truncate text-lg font-semibold sm:text-xl">{hoveredSpell.name}</p>
                  <span className="shrink-0 rounded-full border border-[#5b5480] bg-[#1b1822] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#c9b896]">
                    Lv. {hoveredSpell.level}
                  </span>
                </div>
                <div
                  className={`flex shrink-0 items-center gap-2 rounded-xl bg-[#288FF6] px-2 py-1 ${
                    hoveredSpell.manaCost > 0 ? "" : "invisible"
                  }`}
                >
                  <Image src={manaIcon} alt="Mana" width={20} height={20} />
                  <span className="text-lg font-semibold">{hoveredSpell.manaCost}</span>
                </div>
              </div>
              <p className="mt-1 text-base leading-relaxed text-[#e7dbc1]">
                {hoveredSpell.segments.map((segment: SpellDescriptionSegment, index: number) => (
                  <span
                    key={`${hoveredSpell.id}-${index}`}
                    style={segment.highlight ? { color: "#b7d7ff", fontWeight: 700 } : undefined}
                  >
                    {segment.text}
                  </span>
                ))}
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4 md:gap-4">
          {spells.slice(0, 4).map((spell) => (
            <SpellButton
              key={spell.id}
              name={spell.name}
              icon={spell.icon}
              onMouseEnter={() => setHoveredSpellId(spell.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}