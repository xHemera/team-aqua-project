import { CharacterInstance } from "../Instances/CharacterInstance";
import { resolvePhyDamage } from "../Utils/resolveDamage";
import { Spell } from "./Spell";

export class PiercingShot extends Spell {

    constructor() {
        super();
        this.id     	= "s1";
        this.name   	= "Piercing Shot";
        this.mpCost 	= 8;
        this.targeting 	= "single"
    }

    applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
        const stats			= idUser.character.stats;
        const skillLevel	= idUser.character.skills.find(s => s.id === "s1")?.level ?? 1;
        const raw 			= stats.physicalDamage * 1.2 + skillLevel * 15;
        const reducedRes	= idTargets[0].phyRes * (0.85);
		const damage 		= resolvePhyDamage(raw, idUser, idTargets[0], reducedRes);

		idTargets[0].currentHp = Math.max(0, idTargets[0].currentHp - damage);
    }
}

export class RainOfArrows extends Spell {

	constructor() {
		super();
		this.id		= "s2";
		this.name	= "Rain of Arrows";
		this.mpCost	= 12;
		this.targeting = "aoe"
	}

	applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
		const stats = idUser.character.stats;
		const skillLevel = idUser.character.skills.find(s => s.id == "s2")?.level ?? 1;
		const raw = stats.physicalDamage * 0.8 + skillLevel * 15;
		idTargets.forEach(target => {
			const damage = resolvePhyDamage(raw, idUser, target);
			target.currentHp = Math.max(0, target.currentHp - damage);
		});
	}
}

export class PrecisionFocus extends Spell {

	constructor() {
		super();
		this.id 	= "s3";
		this.name	= "Precision Focus";
		this.mpCost = 15;
		this.targeting = "self";
	}

	applyEffect(idUser: CharacterInstance): void {
		const skillLevel = idUser.character.skills.find(s => s.id === "s3")?.level ?? 1;
	
		idUser.critChanceMod.push({ value: 5 + skillLevel * 2, turn: 3 });
		idUser.critDamageMod.push({ value: skillLevel * 8, turn: 3 });
	}
}
