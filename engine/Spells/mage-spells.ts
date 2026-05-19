import { CharacterInstance } from "../Instances/CharacterInstance";
import { Spell } from "./Spell";
import { applyDamage, resolveMagDamage } from "../Utils/resolveDamage";

export class ArcaneMissiles extends Spell{
	constructor(scaling: number[][]) {
		super(scaling);
		this.id			= "s2";
		this.name		= "Arcane Missiles";
		this.mpCost		= 16;
		this.targeting	= "aoe";
	}

	applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
		const skillLevel = idUser.character.skills.find(s => s.id === this.id)?.level ?? 1;
		const [missileCount, multiplier] = this.scaling[skillLevel - 1];
		const raw = idUser.character.stats.magicalDamage * multiplier;

		for (let i = 0; i < missileCount; i++) {
        const livingTargets = idTargets.filter(t => t.currentHp > 0);
        if (livingTargets.length === 0) break;

        const target = livingTargets[Math.floor(Math.random() * livingTargets.length)];
        const damage = resolveMagDamage(raw, idUser, target);
		applyDamage(idTargets[0], damage);
    }
	}
}

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
			applyDamage(target, damage);
		});
	}
}