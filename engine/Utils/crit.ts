import { CharacterInstance } from "../Instances/CharacterInstance";

export function rollCrit(character: CharacterInstance): boolean {
	return Math.random() * 100 < character.critChance;
}

export function applyCrit(damage: number, character:CharacterInstance): number {
	return damage * (character.critDamage / 100)
}