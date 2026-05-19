import { CharacterInstance } from "../Instances/CharacterInstance";
import { applyDamage, resolvePhyDamage } from "../Utils/resolveDamage";
import { Spell } from "./Spell";

export class ShieldBash extends Spell {
	constructor(scaling: number[][]) {
		super(scaling);
		this.id			= "s1";
		this.name		= "Shield Bash";
		this.mpCost		= 12;
		this.targeting	= "single";
	}

  applyEffect(user: CharacterInstance, idTargets: CharacterInstance[]): void {
    const skillLevel = user.character.skills.find(s => s.id === this.id)?.level ?? 1;
    const [multiplier, flat, stunChance, stunDuration] = this.scaling[skillLevel - 1];

    const raw    = user.character.stats.physicalDamage * multiplier + flat;
    const damage = resolvePhyDamage(raw, user, idTargets[0]);
    applyDamage(idTargets[0], damage);

    if (Math.random() * 100 < stunChance) {
      idTargets[0].stunned = Math.max(idTargets[0].stunned, stunDuration);
    }
  }
}