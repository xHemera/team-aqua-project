import { CharacterInstance } from "../Instances/CharacterInstance";

export type SpellTargeting = "single" | "aoe" | "self";

export abstract class Spell {
	id:			string;
	name:		string;
	effect:		number;
	mpCost:		number;
	level:		number;
	targeting:	SpellTargeting;

	constructor() {
		this.id 		= "default_id";
		this.name 		= "default_name";
		this.effect 	= 0;
		this.mpCost 	= 0;
		this.level 		= 0;
		this.targeting = "single";
	}

	abstract applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void;
}