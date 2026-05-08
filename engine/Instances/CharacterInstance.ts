import { CharacterData } from "../../frontend/components/organisms/characters/types";
import { Spell } from "../Spells/Spell";

export interface ModEntry {
    value:	number;
    turn:	number;
}

export class CharacterInstance {
    uid:			string;
    character:		CharacterData;
    owner:			number;
	currentHp:		number;
	currentMp:		number;
    phyMod:			ModEntry[] = [];
    magMod:			ModEntry[] = [];
    phyResMod:		ModEntry[] = [];
    magResMod:		ModEntry[] = [];
	critChanceMod:	ModEntry[] = [];
	critDamageMod:	ModEntry[] = [];
    spdMod:			ModEntry[] = [];
	poisonMod:		ModEntry[] = [];
	spells:			Map<string, Spell> = new Map();

    constructor(uid: string, character: CharacterData, owner: number) {
        this.uid       = uid;
        this.character = character;
        this.owner     = owner;
		this.currentHp = character.stats.hp;
		this.currentMp = character.stats.mp;
    }

    get phyRes(): number {
        return this.character.stats.physicalResistance;
    }

    get magRes(): number {
        return this.character.stats.magicalResistance;
    }

	get critChance(): number {
		return this.character.stats.critChance
			+ this.critChanceMod.reduce((acc, { value }) => acc + value, 0);
	}

	get critDamage(): number {
		return this.character.stats.critDamage
			+ this.critDamageMod.reduce((acc, { value }) => acc + value, 0);
	}
}