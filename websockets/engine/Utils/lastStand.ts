import { CharacterInstance } from "../Instances/CharacterInstance";

export function checkLastStand(character: CharacterInstance): void {
  if (character.lastStandUsed || !character.lastStandUsable) return;

  character.lastStandUsable = false;
  const spell = character.spells.get("s3");
  if (!spell) return;

  const skillLevel   = character.character.skills.find(s => s.id === "s3")?.level ?? 1;
  const [hpThreshold, shieldPercent] = spell.scaling[skillLevel - 1];

  const hpPercent = (character.currentHp / character.character.stats.hp) * 100;

  if (hpPercent < hpThreshold) {
    character.shieldHp      = Math.floor(character.character.stats.hp * shieldPercent / 100);
    character.lastStandUsed = true;
  }
}