import { CharacterInstance } from "../Instances/CharacterInstance";

export function rollCrit(character: CharacterInstance): boolean {
	const crit: boolean = Math.random() * 100 < character.critChance;
	if (crit) console.log("BOUM SHAKALAKAH !")
	return crit;
}

export function applyCrit(damage: number, character:CharacterInstance): number {
	return damage * (1 + character.critDamage / 100)
}