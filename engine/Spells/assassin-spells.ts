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
		var halfhp			= 1;
		if (idTargets[0].currentHp < (idTargets[0].character.stats.hp) /2)
			halfhp = 1.30;
		const damage = resolvePhyDamage(raw*halfhp, idUser, idTargets[0]);

		idTargets[0].currentHp = Math.max(0, idTargets[0].currentHp - damage);
	}
}