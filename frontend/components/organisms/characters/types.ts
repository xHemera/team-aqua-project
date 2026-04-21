export type CharacterSkill = {
  id: string;
  name: string;
  image: string;
  description: string;
  unlockLevel?: number;
  level: number;
  cost: number;
};

export type CharacterStats = {
  physicalDamage: number;
  magicalDamage: number;
  critChance: number;
  critDamage: number;
  hp: number;
  mp: number;
  physicalResistance: number;
  magicalResistance: number;
  speed: number;
};

export type CharacterBaseStats = {
  physicalDamage: number;
  magicalDamage: number;
  critChance: number;
  critDamage: number;
  hp: number;
  mp: number;
  physicalResistance: number;
  magicalResistance: number;
  speed: number;
};

export type CharacterData = {
  id: string;
  name: string;
  portrait: string;
  body: string;
  baseStats: CharacterBaseStats;
  level: number;
  xpPercent: number;
  levelUpCost: number;
  skills: CharacterSkill[];
  stats: CharacterStats;
};

export type PlayerResources = {
  ruby: number;
  coin: number;
};

export type SkillEffectSegment = {
  text: string;
  highlight?: boolean;
};

export type ResolvedSkillEffect = {
  title: string;
  segments: SkillEffectSegment[];
};
