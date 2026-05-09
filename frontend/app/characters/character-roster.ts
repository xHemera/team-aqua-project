import type { CharacterData, CharacterStats, PlayerResources } from "@/components/organisms/characters/types";
import { archer } from "../../public/gameResources/heroes/archer/hero";
import { assassin } from "../../public/gameResources/heroes/assassin/hero";
import { healer } from "../../public/gameResources/heroes/healer/hero";
import { knight } from "../../public/gameResources/heroes/knight/hero";
import { mage } from "../../public/gameResources/heroes/mage/hero";

type HeroResource = {
  identity: {
    id: string;
    name: string;
    assets: {
      portrait: string;
      body: string;
    };
  };
  baseStats: CharacterData["baseStats"];
  skills: Array<{
    id: string;
    type: string;
    info: {
      name: string;
      icon: string;
      description: string;
    };
    unlockLevel: number;
    manaCost: number;
    scaling: unknown[];
  }>;
};

type CharacterSeed = {
  id: string;
  hero: HeroResource;
  level: number;
  xpPercent: number;
  levelUpCost: number;
  skillLevels: number[];
  stats: CharacterStats;
};

const createCharacter = ({ id, hero, level, xpPercent, levelUpCost, skillLevels, stats }: CharacterSeed): CharacterData => ({
  id,
  name: hero.identity.name,
  portrait: hero.identity.assets.portrait,
  body: hero.identity.assets.body,
  baseStats: hero.baseStats,
  level,
  xpPercent,
  levelUpCost,
  skills: hero.skills.map((skill, index) => ({
    id: skill.id,
    name: skill.info.name,
    image: skill.info.icon,
    description: skill.info.description,
    unlockLevel: skill.unlockLevel,
    level: skillLevels[index] ?? 1,
    cost: skill.manaCost,
  })),
  stats,
});

const CHARACTER_SEEDS: CharacterSeed[] = [
  {
    id: "archer-1",
    hero: archer,
    level: 12,
    xpPercent: 67,
    levelUpCost: 450,
    skillLevels: [4, 3, 2],
    stats: {
      physicalDamage: 245,
      magicalDamage: 68,
      critChance: 22,
      critDamage: 215,
      hp: 1680,
      mp: 245,
      physicalResistance: 18,
      magicalResistance: 13,
      speed: 138,
    },
  },
  {
    id: "assassin-1",
    hero: assassin,
    level: 14,
    xpPercent: 34,
    levelUpCost: 580,
    skillLevels: [5, 3, 2],
    stats: {
      physicalDamage: 312,
      magicalDamage: 58,
      critChance: 31,
      critDamage: 268,
      hp: 1420,
      mp: 205,
      physicalResistance: 15,
      magicalResistance: 10,
      speed: 158,
    },
  },
  {
    id: "healer-1",
    hero: healer,
    level: 11,
    xpPercent: 82,
    levelUpCost: 380,
    skillLevels: [4, 2, 2],
    stats: {
      physicalDamage: 92,
      magicalDamage: 238,
      critChance: 12,
      critDamage: 178,
      hp: 1860,
      mp: 445,
      physicalResistance: 13,
      magicalResistance: 20,
      speed: 118,
    },
  },
  {
    id: "knight-1",
    hero: knight,
    level: 15,
    xpPercent: 56,
    levelUpCost: 720,
    skillLevels: [5, 4, 2],
    stats: {
      physicalDamage: 218,
      magicalDamage: 88,
      critChance: 16,
      critDamage: 192,
      hp: 2860,
      mp: 175,
      physicalResistance: 29,
      magicalResistance: 18,
      speed: 108,
    },
  },
  {
    id: "mage-1",
    hero: mage,
    level: 13,
    xpPercent: 45,
    levelUpCost: 520,
    skillLevels: [5, 3, 2],
    stats: {
      physicalDamage: 82,
      magicalDamage: 298,
      critChance: 24,
      critDamage: 235,
      hp: 1280,
      mp: 525,
      physicalResistance: 11,
      magicalResistance: 24,
      speed: 128,
    },
  },
];

export const CHARACTERS: CharacterData[] = CHARACTER_SEEDS.map(createCharacter);

export const PLAYER_RESOURCES: PlayerResources = {
  ruby: 42,
  coin: 45680,
};

export const MAX_CHARACTER_LEVEL = 50;
export const MAX_SKILL_LEVEL = 10;