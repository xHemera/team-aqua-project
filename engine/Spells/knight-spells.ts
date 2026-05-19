import { CharacterInstance } from "../Instances/CharacterInstance";
import { resolvePhyDamage } from "../Utils/resolveDamage";
import { Spell } from "./Spell";

export class ShieldBash extends Spell {
	constructor(scaling: number[][]) {
		super(scaling);
		this.id			= "s1";
		this.name		= "Shield Bash";
		this.mpCost		= 12;
		this.targeting	= "single";
	}

  applyEffect(user: CharacterInstance, targets: CharacterInstance[]): void {
    const skillLevel = user.character.skills.find(s => s.id === this.id)?.level ?? 1;
    const [multiplier, flat, stunChance, stunDuration] = this.scaling[skillLevel - 1];

    const raw    = user.character.stats.physicalDamage * multiplier + flat;
    const damage = resolvePhyDamage(raw, user, targets[0]);
    targets[0].currentHp = Math.max(0, targets[0].currentHp - damage);

    if (Math.random() * 100 < stunChance) {
      targets[0].stunned = Math.max(targets[0].stunned, stunDuration);
    }
  }
}