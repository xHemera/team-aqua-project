import type { CharacterSkill, CharacterStats, ResolvedSkillEffect } from "./types";

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
      { key: "mp", label: "Mana", icon: "fa-droplet", iconColor: "text-[#7fd9ff]" },
      { key: "physicalResistance", label: "P.Res", icon: "fa-shield", iconColor: "text-[#9ed7a8]" },
      { key: "magicalResistance", label: "M.Res", icon: "fa-wand-magic-sparkles", iconColor: "text-[#98b8ff]" },
    ],
  },
  {
    id: "mobility",
    title: "Mobility",
    titleClassName: "border-[#4a3a76] bg-[#21183b] text-[#d3c2ff]",
    items: [{ key: "speed", label: "Speed", icon: "fa-gauge-high", iconColor: "text-[#c0b3ff]" }],
  },
] as const;

export const CHARACTER_STAT_ROWS = [
  { key: "physicalDamage", label: "P. ATK", icon: "fa-hand-fist", iconColor: "text-[#ff8a7a]" },
  { key: "magicalDamage", label: "M. ATK", icon: "fa-wand-magic-sparkles", iconColor: "text-[#7ecbff]" },
  { key: "critChance", label: "Crit%", icon: "fa-crosshairs", iconColor: "text-[#f0d27a]" },
  { key: "critDamage", label: "Crit DMG", icon: "fa-star", iconColor: "text-[#ff9ecb]" },
  { key: "hp", label: "HP", icon: "fa-heart", iconColor: "text-[#8fdf8f]" },
  { key: "mp", label: "Mana", icon: "fa-droplet", iconColor: "text-[#7fd9ff]" },
  { key: "physicalResistance", label: "P. RES", icon: "fa-shield", iconColor: "text-[#9ed7a8]" },
  { key: "magicalResistance", label: "M. RES", icon: "fa-wand-magic-sparkles", iconColor: "text-[#98b8ff]" },
  { key: "speed", label: "Speed", icon: "fa-gauge-high", iconColor: "text-[#c0b3ff]" },
] as const;

export const getStatBonus = (baseValue: number, totalValue: number) => Math.max(totalValue - baseValue, 0);

const FORMULA_TOKEN_PATTERN = /\{([^}]+)\}/g;

// Evaluate a formula expression safely
const evaluateFormula = (expression: string, stats: CharacterStats, skill: CharacterSkill): number | null => {
  try {
    // Normalize the expression
    let formula = expression.trim().toLowerCase();

    // Replace stat references
    const statMappings: Record<string, number> = {
      "physical damage": stats.physicalDamage.toString(),
      "physical damage": stats.physicalDamage.toString(),
      "magic damage": stats.magicalDamage.toString(),
      "magical damage": stats.magicalDamage.toString(),
      "physical resistance": stats.physicalResistance.toString(),
      "physical resist": stats.physicalResistance.toString(),
      "magical resistance": stats.magicalResistance.toString(),
      "magic resistance": stats.magicalResistance.toString(),
      "skill level": skill.level.toString(),
      "max hp": stats.hp.toString(),
      "max mp": stats.mp.toString(),
    };

    // Replace known stat names
    for (const [pattern, value] of Object.entries(statMappings)) {
      const regex = new RegExp(`\\b${pattern.replace(/\s+/g, "\\s+")}\\b`, "gi");
      formula = formula.replace(regex, value);
    }

    // Handle percentage notation (e.g., "15%" -> "15")
    formula = formula.replace(/(\d+)%/g, "$1");

    // Check if formula still has unknown variables (contains letters)
    if (/[a-zA-Z]/.test(formula)) {
      // It might contain Math functions or other valid JS
      const validFunctions = ["math.floor", "math.ceil", "math.round", "math.max", "math.min"];
      const hasOnlyValidFunctions = validFunctions.some(fn => formula.includes(fn));

      if (!hasOnlyValidFunctions && /[a-zA-Z]/.test(formula.replace(/math\./gi, ""))) {
        return null; // Unknown variable
      }
    }

    // Replace Math with actual Math object reference
    formula = formula.replace(/math\./gi, "Math.");

    // Validate characters (only numbers, operators, parens, dots, Math.)
    if (!/^[\d\+\-\*\/\(\)\.\s,Math]+$/.test(formula.replace(/Math\./g, ""))) {
      return null;
    }

    // Evaluate using Function constructor (safer than eval)
    const result = new Function(`"use strict"; return (${formula});`)();

    if (typeof result !== "number" || !Number.isFinite(result)) {
      return null;
    }

    return result;
  } catch {
    return null;
  }
};

// Format a number for display
const formatNumber = (value: number): string => {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  // Round to 1 decimal place if needed
  const rounded = Math.round(value * 10) / 10;
  return rounded.toString();
};

// Parse a description and resolve all formulas
export const resolveSkillDescription = (
  description: string,
  stats: CharacterStats,
  skill: CharacterSkill
): ResolvedSkillEffect => {
  const segments: Array<{ text: string; highlight?: boolean }> = [];
  let lastIndex = 0;

  // Find all formula tokens {expression}
  for (const match of description.matchAll(FORMULA_TOKEN_PATTERN)) {
    const fullMatch = match[0];
    const expression = match[1];
    const startIndex = match.index ?? 0;

    // Add text before this formula
    if (startIndex > lastIndex) {
      segments.push({ text: description.slice(lastIndex, startIndex) });
    }

    // Evaluate the formula
    const result = evaluateFormula(expression, stats, skill);

    if (result !== null) {
      segments.push({ text: formatNumber(result), highlight: true });
    } else {
      // Could not evaluate, keep original but styled differently
      segments.push({ text: `{${expression}}`, highlight: true });
    }

    lastIndex = startIndex + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < description.length) {
    segments.push({ text: description.slice(lastIndex) });
  }

  return {
    title: skill.name,
    segments: segments.length > 0 ? segments : [{ text: description }],
  };
};

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
  // More realistic power calculation for actual game balance
  const offense = (stats.physicalDamage * 1.5) + (stats.magicalDamage * 1.5) + (stats.critChance * stats.critDamage / 100);
  const resistanceScore = (stats.physicalResistance + stats.magicalResistance) * 12;
  const defense = stats.hp * 0.5 + stats.mp * 0.2 + resistanceScore;
  const utility = stats.speed * 2;

  return Math.round(offense + defense + utility);
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
  if (!skill.description) return null;

  return resolveSkillDescription(skill.description, stats, skill);
};
