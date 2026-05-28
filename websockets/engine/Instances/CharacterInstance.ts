import { Spell } from "../Spells/Spell";
import { HeroData } from "./HeroData";

export interface ModEntry {
    value:	number;
    turn:	number;
}

export type PoisonEntry = ModEntry;

export class CharacterInstance {
    uid:				string;
    character:			HeroData;
    owner:				number;
	currentHp:			number;
	currentMp:			number;
    phyMod:				ModEntry[] = [];
    magMod:				ModEntry[] = [];
    phyResMod:			ModEntry[] = [];
    magResMod:			ModEntry[] = [];
	critChanceMod:		ModEntry[] = [];
	critDamageMod:		ModEntry[] = [];
    spdMod:				ModEntry[] = [];
	poison:				PoisonEntry[] = [];
	invisible:			number = 0;
	nextAttackBonus:	number = 0;
	stunned:			number = 0;
	overHp:				number = 0;
	invul:				number = 0;
    taunted:            number  = 0;
    shieldHp:           number  = 0; 
    lastStandUsable:    boolean = false; 
    lastStandUsed:      boolean = false; 
	spells:				Map<string, Spell> = new Map();
	hasBeenCrit:		boolean = false;

    constructor(uid: string, character: HeroData, owner: number) {
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