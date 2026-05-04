import { CharacterInstance } from "../Instances/CharacterInstance";
import { resolvePhyDamage } from "../Utils/resolveDamage";
import { Spell } from "./Spells";

export class PiercingShot extends Spell {

    private readonly RESISTANCE_IGNORE = 0.15;

    constructor() {
        super();
        this.id     = "s1";
        this.name   = "Piercing Shot";
        this.mpCost = 8;
        this.level  = 1;
    }

    dealDamage(idUser: CharacterInstance, idTarget: CharacterInstance): number {
        const stats      = idUser.character.stats;
        const skillLevel = idUser.character.skills.find(s => s.id === "s1")?.level ?? 1;

        // {physical damage * 1.2 + skill level * 15}
        const raw = stats.physicalDamage * 1.2 + skillLevel * 15;

        // Ignore 15% de résistance
        const reducedRes = idTarget.phyRes * (1 - this.RESISTANCE_IGNORE);

        return resolvePhyDamage(raw, idUser, idTarget, reducedRes);
    }
}

export class RainOfArrows extends Spell {

	constructor() {
		super();
		this.id		= "s2";
		this.name	= "Rain of Arrows";
		this.mpCost	= 12;
		this.level	= 1;
	}

	dealDamage(idUser: CharacterInstance, idTargets: CharacterInstance[]): number[] {
		const stats = idUser.character.stats;
		const skillLevel = idUser.character.skills.find(s => s.id == "s2")?.level ?? 1;

		const raw = stats.physicalDamage * 0.8 + skillLevel * 15;

		return idTargets.map(target => resolvePhyDamage(raw, idUser, target));
	}
	
}

export class PrecisionFocus extends Spell {

	constructor() {
		super();
		this.id 	= "s3";
		this.name	= "Precision Focus";
		this.mpCost = 15;
		this.level	= 1;
	}

	applyBuff(idUser: CharacterInstance): void {
		const skillLevel = idUser.character.skills.find(s => s.id === "s3")?.level ?? 1;
	
		idUser.critChanceMod.push({
			value: 5 + skillLevel * 2,
			turn: 3,
		});

		idUser.critDamageMod.push({
			value: skillLevel * 8,
			turn: 3,
		});
	}
}
