import { CharacterInstance } from "../Instances/CharacterInstance";

export function rollCrit(character: CharacterInstance): boolean {
	return Math.random() * 100 < character.character.stats.critChance;
}

export function applyCrit(damage: number, character:CharacterInstance): number {
	return damage * (character.character.stats.critDamage / 100)
}