import { CharacterInstance } from "../Instances/CharacterInstance";
import { Spell } from "./Spell";

export class HealingLight extends Spell {
	constructor(scaling: number[][]) {
		super(scaling);
		this.id			= "s1";
		this.name		= "Healing light";
		this.mpCost		= 10;
		this.targeting	= "single";
	}

	applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
        const skillLevel = idUser.character.skills.find(s => s.id === this.id)?.level ?? 1;
		const [healMultiplier, flatHeal] = this.scaling[skillLevel - 1];
	
		const raw = idUser.character.stats.magicalDamage * healMultiplier + flatHeal;
		idTargets[0].currentHp = Math.min(idTargets[0].character.stats.hp, idTargets[0].currentHp + raw);
	}
}

// export class Sanctuary extends Spell {
// 	constructor(scaling: number[][]) {
// 		super(scaling);
// 		this.id			= "s2";
// 		this.name		= "Sanctuary";
// 		this.mpCost		= 18;
// 		this.targeting	= "teamAoe";
// 	}

// 	applyEffect(idUser: CharacterInstance, idTargets: CharacterInstance[]): void {
//         const skillLevel = idUser.character.skills.find(s => s.id === this.id)?.level ?? 1;
// 		const [healMultiplier, flatHeal, defenseBonus, duration] = this.scaling[skillLevel - 1];
// 		const raw = idUser.character.stats.magicalDamage * healMultiplier + flatHeal;	
// 	}
// }