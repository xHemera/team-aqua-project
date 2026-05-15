import { CharacterInstance } from "../Instances/CharacterInstance";
import { Spell } from "./Spell";
import { resolvePhyDamage } from "../Utils/resolveDamage";

export class ShadowStrike extends Spell {
	constructor() {
		super();
		this.id			= "s1";
		this.name		= "Shadow Strike";
		this.mpCost		= 10;
		this.targeting	= "single"
	}

	applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
		const stats			= idUser.character.stats;
		const skillLevel	= idUser.character.skills.find(s => s.id === "s1")?.level ?? 1;
		const raw			= stats.physicalDamage * 1.5 + skillLevel * 20;
		const bonus			= idTargets[0].currentHp < idTargets[0].character.stats.hp / 2 ? 1.30 : 1;
		const damage		= resolvePhyDamage(raw * bonus, idUser, idTargets[0]);

		idTargets[0].currentHp = Math.max(0, idTargets[0].currentHp - damage);
	}
}

export class VenomBlade extends Spell {
	constructor() {
		super();
		this.id			= "s2";
		this.name 		= "Venom Blade";
		this.mpCost		= 14;
		this.targeting	= "single"
	}

	applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
		const stats			= idUser.character.stats;
		const skillLevel	= idUser.character.skills.find(s => s.id === "s2")?.level ?? 1;
		const raw			= stats.physicalDamage * 0.9 + skillLevel * 12;
		const damage		= resolvePhyDamage(raw, idUser, idTargets[0]);
	
		idTargets[0].currentHp = Math.max(0, idTargets[0].currentHp - damage);
		idTargets[0].poison.push({
			value: skillLevel * 8,
			turn: 3,
		});
	}
}

export class PhantomStep extends Spell {
    constructor() {
		super();
        this.id        = "s3";
        this.name      = "Phantom Step";
        this.mpCost    = 18;
        this.targeting = "self";
    }

	applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
        const skillLevel = idUser.character.skills.find(s => s.id === "s3")?.level ?? 1;

        idUser.invisible       = 1 + Math.floor(skillLevel / 3);
        idUser.nextAttackBonus = skillLevel * 15;
    }
}