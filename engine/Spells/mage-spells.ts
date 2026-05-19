import { trace } from "console";
import { CharacterInstance } from "../Instances/CharacterInstance";
import { Spell } from "./Spell";
import { resolveMagDamage } from "../Utils/resolveDamage";

export class Meteor extends Spell{
	constructor(scaling: number[][]) {
		super(scaling);
		this.id			= "s3";
		this.name		= "Meteor";
		this.mpCost		= 20;
		this.targeting	= "aoe";
	}

	applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
		const skillLevel = idUser.character.skills.find(s => s.id === this.id)?.level ?? 1;
		const [multiplier, flat] = this.scaling[skillLevel - 1];

		const raw	= idUser.character.stats.magicalDamage * multiplier + flat;
		idTargets.forEach(target => {
			const damage = resolveMagDamage(raw, idUser, target);
			target.currentHp = Math.max(0, target.currentHp - damage);
		});
	}
}