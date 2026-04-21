import { CharacterInstance } from "../Instances/CharacterInstance";

export function resolvePhyDamage(raw: number, idUser: CharacterInstance ,idTarget: CharacterInstance) : number {
	let retValue: number = raw
	idUser.phyMod.forEach((value) => retValue = retValue * value)
	idUser.phyTurn.forEach((value) => value --)
	idTarget.defMod.forEach((value) => retValue = retValue * value)
	idTarget.defTurn.forEach((value) => value--)
	return retValue
}

export function resolveMagDamage(raw: number, idUser: CharacterInstance ,idTarget: CharacterInstance) : number {
	let retValue: number = raw
	idUser.magMod.forEach((value) => retValue = retValue * value)
	idUser.magTurn.forEach((value) => value --)
	idTarget.defMMod.forEach((value) => retValue = retValue * value)
	idTarget.defMTurn.forEach((value) => value--)
	return retValue
}