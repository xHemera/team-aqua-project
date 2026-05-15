import type { CharacterSkill } from "./types";

export const CHARACTER_ROLES: Record<string, { title: string; color: string; icon: string }> = {
  Archer: { title: "Wind Ranger", color: "#4fc3f7", icon: "fa-wind" },
  Assassin: { title: "Shadowblade", color: "#ff5252", icon: "fa-skull" },
  Healer: { title: "Divine Oracle", color: "#69f0ae", icon: "fa-hands-praying" },
  Knight: { title: "Iron Guardian", color: "#ffd740", icon: "fa-shield-halved" },
  Mage: { title: "Arcane Weaver", color: "#e040fb", icon: "fa-hat-wizard" },
};

export const SKILL_TYPE_CONFIG: Record<string, { color: string; icon: string; label: string; borderColor: string }> = {
  attack: { color: "#cd5c5c", icon: "fa-fire", label: "Offensive", borderColor: "rgba(205, 92, 92, 0.5)" },
  heal: { color: "#8fbc8f", icon: "fa-heart-pulse", label: "Healing", borderColor: "rgba(143, 188, 143, 0.5)" },
  buff: { color: "#daa520", icon: "fa-shield-halved", label: "Buff", borderColor: "rgba(218, 165, 32, 0.5)" },
  debuff: { color: "#9370db", icon: "fa-skull", label: "Debuff", borderColor: "rgba(147, 112, 219, 0.5)" },
  ultimate: { color: "#ffd700", icon: "fa-meteor", label: "Ultimate", borderColor: "rgba(255, 215, 0, 0.6)" },
};

export const OFFENSE_STATS = [
  { key: "physicalDamage", label: "Physical ATK", icon: "fa-hand-fist", shortLabel: "P.ATK" },
  { key: "magicalDamage", label: "Magical ATK", icon: "fa-wand-magic-sparkles", shortLabel: "M.ATK" },
  { key: "critChance", label: "Critical Rate", icon: "fa-crosshairs", suffix: "%", shortLabel: "Crit%" },
  { key: "critDamage", label: "Critical Damage", icon: "fa-burst", suffix: "%", shortLabel: "Crit DMG" },
] as const;

export const DEFENSE_STATS = [
  { key: "hp", label: "Health Points", icon: "fa-heart", shortLabel: "HP" },
  { key: "mp", label: "Mana Points", icon: "fa-droplet", shortLabel: "MP" },
  { key: "physicalResistance", label: "Physical Resistance", icon: "fa-shield", shortLabel: "P.RES", suffix: "%" },
  { key: "magicalResistance", label: "Magical Resistance", icon: "fa-wand-magic-sparkles", shortLabel: "M.RES", suffix: "%" },
] as const;

export const UTILITY_STATS = [
  { key: "speed", label: "Speed", icon: "fa-bolt", shortLabel: "SPD" },
] as const;

export const getSkillType = (skill: CharacterSkill, maxSkillLevel: number): keyof typeof SKILL_TYPE_CONFIG => {
  const name = skill.name.toLowerCase();
  if (skill.level >= maxSkillLevel) return "ultimate";
  if (name.includes("meteor") || name.includes("sanctuary") || name.includes("last stand") || name.includes("divine protection")) return "ultimate";
  if (name.includes("heal") || name.includes("restoration")) return "heal";
  if (name.includes("boost") || name.includes("fortify") || name.includes("amplify") || name.includes("focus") || name.includes("will")) return "buff";
  if (name.includes("silence") || name.includes("stun") || name.includes("venom") || name.includes("poison") || name.includes("bash")) return "debuff";
  return "attack";
};
