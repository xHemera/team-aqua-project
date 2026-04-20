import type { CharacterSkill, CharacterStats, ResolvedSkillEffect } from "./types";

type SkillEffectTemplate = {
  title: string;
  description: string;
};

const SKILL_EFFECTS: Record<string, SkillEffectTemplate> = {
  "Water Spell": {
    title: "Water Arrow",
    description:
      "Inflige {physical damage * skill level} degats a la cible (AoE), si le spell est utilise plusieurs fois d'affile, les degats augmentent de 60% a chaque fois",
  },
  "Frenzy Spell": {
    title: "Attack Boost",
    description: "Augmente les degats du prochain sort de {10% * skill level}",
  },
  Stunned: {
    title: "Stun",
    description:
      "Pendant le prochain tour de la cible, si il lance un sort il a {10% * skill level} de chances de le louper",
  },
  Healing: {
    title: "Healing",
    description: "Restore {10% * skill level} des PV max de la cible",
  },
  "Defense Boost": {
    title: "Defense Boost",
    description: "Reduit de {10% * skill level} les degats recu par l'equipe lors du prochain tour",
  },
  "Divine Protection": {
    title: "Divine Protection",
    description: "Annule tout les degats recu par la cible lors du prochain tour",
  },
  Fortify: {
    title: "Fortify",
    description: "Reduit les degats recus de {3% * skill level} pendant 1 tour.",
  },
  "Damage Boost": {
    title: "Damage Boost",
    description: "Augment les degats de la prochaine attaque normale de {5% * skill level}",
  },
  Berserk: {
    title: "Berserk",
    description:
      "Durant les 3 prochain tour, augmente de {12% * skill level} toute source de degats recu et augmente de {10% * skill level} toute source de degats infliges",
  },
  Silence: {
    title: "Silence",
    description: "La cible ne pourra pas lance de sort lors du prochain tour",
  },
  "Poison Dart": {
    title: "Poison Dart",
    description: "Inflige {physical damage * 1.5 * skill level} degats et empoisonne la cible pendant 3 tour",
  },
  Amplify: {
    title: "Amplify",
    description:
      "Votre prochaine instance de DoT infligera des degats critique garantie a hauteur de {100% * skill level} (Les degats sont infliges autant de fois que le DoT devait rester, cleanse le DoT)",
  },
  Fireball: {
    title: "Fireball (lv. 1)",
    description: "Inflige {magic damage * skill level} degats en AoE",
  },
  "Mana Restoration": {
    title: "Mana Restoration (lv. 3)",
    description: "Redonne {skill level} MP a la cible",
  },
  Counterspell: {
    title: "Counterspell (lv. 5)",
    description:
      "Pendant le prochain tour, la cible ne recevra aucun effet du premier sort adverse (les degats sont un effet)",
  },
};

export const LEVEL_UP_READY_CLASS = "!border-[#2f7f4f] !bg-[#1f5b37] !text-[#dcffe9] hover:!bg-[#286f44]";

export const STAT_GROUPS = [
  {
    id: "offense",
    title: "Offense",
    titleClassName: "border-[#6a2b2b] bg-[#311717] text-[#ffb3b3]",
    items: [
      { key: "physicalDamage", label: "P.ATK", icon: "fa-hand-fist", iconColor: "text-[#ff8a7a]" },
      { key: "magicalDamage", label: "M.ATK", icon: "fa-wand-magic-sparkles", iconColor: "text-[#7ecbff]" },
      { key: "critChance", label: "Crit%", icon: "fa-crosshairs", iconColor: "text-[#f0d27a]" },
      { key: "critDamage", label: "CritDMG", icon: "fa-star", iconColor: "text-[#ff9ecb]" },
    ],
  },
  {
    id: "defense",
    title: "Defense",
    titleClassName: "border-[#2c5b36] bg-[#16301c] text-[#b9efc5]",
    items: [
      { key: "hp", label: "HP", icon: "fa-heart", iconColor: "text-[#8fdf8f]" },
      { key: "mp", label: "MP", icon: "fa-droplet", iconColor: "text-[#7fd9ff]" },
    ],
  },
  {
    id: "mobility",
    title: "Mobility",
    titleClassName: "border-[#4a3a76] bg-[#21183b] text-[#d3c2ff]",
    items: [{ key: "speed", label: "Speed", icon: "fa-gauge-high", iconColor: "text-[#c0b3ff]" }],
  },
] as const;

const formatPercent = (value: number) => `${value.toFixed(0)}%`;

export const formatCompactPower = (value: number) => {
  const units = ["", "k", "M", "B"];
  let scaledValue = value;
  let unitIndex = 0;

  while (scaledValue >= 1000 && unitIndex < units.length - 1) {
    scaledValue /= 1000;
    unitIndex += 1;
  }

  let formattedValue = Number(scaledValue.toFixed(1));

  if (formattedValue >= 1000 && unitIndex < units.length - 1) {
    formattedValue = Number((formattedValue / 1000).toFixed(1));
    unitIndex += 1;
  }

  return `${formattedValue}${units[unitIndex]}`;
};

export const calculatePower = (stats: CharacterStats) => {
  const base =
    (stats.physicalDamage + stats.magicalDamage) +
    (stats.critChance * stats.critDamage) +
    (stats.hp + stats.mp);

  return Math.round(base * (stats.speed / 100));
};

export const getLevelUpState = (currentLevel: number, maxLevel: number, cost: number, availableResource: number) => {
  const hasUpgradeAvailable = currentLevel < maxLevel;
  const hasEnoughResources = availableResource >= cost;
  const canLevelUp = hasUpgradeAvailable && hasEnoughResources;

  return { hasUpgradeAvailable, hasEnoughResources, canLevelUp };
};

export const getSkillTooltipPositionClassName = (index: number) => {
  if (index === 0) return "left-0 -translate-x-0";
  if (index === 2) return "left-auto right-0 translate-x-0";
  return "left-1/2 -translate-x-1/2";
};

export const resolveSkillEffect = (skill: CharacterSkill, stats: CharacterStats): ResolvedSkillEffect | null => {
  const effect = SKILL_EFFECTS[skill.name];
  if (!effect) return null;

  if (skill.name === "Water Spell") {
    const damage = Math.round(stats.physicalDamage * skill.level);
    return {
      title: effect.title,
      segments: [
        { text: "Inflige " },
        { text: `${damage}`, highlight: true },
        {
          text: " degats a la cible (AoE).\nSi le spell est utilise plusieurs fois d'affile, les degats augmentent de 60% a chaque fois.",
        },
      ],
    };
  }

  if (skill.name === "Frenzy Spell") {
    const bonusPercent = 10 * skill.level;
    return {
      title: effect.title,
      segments: [
        { text: "Augmente les degats du prochain sort de " },
        { text: `${formatPercent(bonusPercent)}`, highlight: true },
        { text: "." },
      ],
    };
  }

  if (skill.name === "Stunned") {
    const missChance = 10 * skill.level;
    return {
      title: effect.title,
      segments: [
        { text: "Pendant le prochain tour de la cible, si il lance un sort il a " },
        { text: `${formatPercent(missChance)}`, highlight: true },
        { text: " de chances de le louper." },
      ],
    };
  }

  if (skill.name === "Healing") {
    const healPercent = 10 * skill.level;
    return {
      title: effect.title,
      segments: [
        { text: "Restore " },
        { text: `${formatPercent(healPercent)}`, highlight: true },
        { text: " des PV max de la cible." },
      ],
    };
  }

  if (skill.name === "Defense Boost") {
    const reduction = 10 * skill.level;
    return {
      title: effect.title,
      segments: [
        { text: "Reduit de " },
        { text: `${formatPercent(reduction)}`, highlight: true },
        { text: " les degats recu par l'equipe lors du prochain tour." },
      ],
    };
  }

  if (skill.name === "Divine Protection") {
    return {
      title: effect.title,
      segments: [{ text: "Annule tout les degats recu par la cible lors du prochain tour." }],
    };
  }

  if (skill.name === "Fortify") {
    const reduction = 3 * skill.level;
    return {
      title: effect.title,
      segments: [
        { text: "Reduit les degats recus de " },
        { text: `${formatPercent(reduction)}`, highlight: true },
        { text: " pendant 1 tour." },
      ],
    };
  }

  if (skill.name === "Damage Boost") {
    const bonus = 5 * skill.level;
    return {
      title: effect.title,
      segments: [
        { text: "Augment les degats de la prochaine attaque normale de " },
        { text: `${formatPercent(bonus)}`, highlight: true },
        { text: "." },
      ],
    };
  }

  if (skill.name === "Berserk") {
    const receivedBonus = 12 * skill.level;
    const inflictedBonus = 10 * skill.level;
    return {
      title: effect.title,
      segments: [
        { text: "Durant les 3 prochain tour, augmente de " },
        { text: `${formatPercent(receivedBonus)}`, highlight: true },
        { text: " toute source de degats recu et augmente de " },
        { text: `${formatPercent(inflictedBonus)}`, highlight: true },
        { text: " toute source de degats infliges." },
      ],
    };
  }

  if (skill.name === "Silence") {
    return {
      title: effect.title,
      segments: [{ text: "La cible ne pourra pas lance de sort lors du prochain tour." }],
    };
  }

  if (skill.name === "Poison Dart") {
    const damage = Math.round(stats.physicalDamage * 1.5 * skill.level);
    return {
      title: effect.title,
      segments: [
        { text: "Inflige " },
        { text: `${damage}`, highlight: true },
        { text: " degats et empoisonne la cible pendant 3 tour." },
      ],
    };
  }

  if (skill.name === "Amplify") {
    const guaranteedCritical = 100 * skill.level;
    return {
      title: effect.title,
      segments: [
        { text: "Votre prochaine instance de DoT infligera des degats critique garantie a hauteur de " },
        { text: `${formatPercent(guaranteedCritical)}`, highlight: true },
        {
          text: " (Les degats sont infliges autant de fois que le DoT devait rester, cleanse le DoT).",
        },
      ],
    };
  }

  if (skill.name === "Fireball") {
    const damage = Math.round(stats.magicalDamage * skill.level);
    return {
      title: effect.title,
      segments: [
        { text: "Inflige " },
        { text: `${damage}`, highlight: true },
        { text: " degats en AoE." },
      ],
    };
  }

  if (skill.name === "Mana Restoration") {
    return {
      title: effect.title,
      segments: [
        { text: "Redonne " },
        { text: `${skill.level}`, highlight: true },
        { text: " MP a la cible." },
      ],
    };
  }

  if (skill.name === "Counterspell") {
    return {
      title: effect.title,
      segments: [
        {
          text: "Pendant le prochain tour, la cible ne recevra aucun effet du premier sort adverse (les degats sont un effet).",
        },
      ],
    };
  }

  return {
    title: effect.title,
    segments: [{ text: effect.description }],
  };
};
