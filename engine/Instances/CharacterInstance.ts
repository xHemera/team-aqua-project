import { CharacterData } from "../../frontend/components/organisms/characters/types";

export interface ModEntry {
    value:	number;
    turn:	number;
}

export class CharacterInstance {
    uid:		string;
    character:	CharacterData;
    owner:		number;
    phyMod:		ModEntry[] = [];
    magMod:		ModEntry[] = [];
    phyResMod:	ModEntry[] = [];
    magResMod:	ModEntry[] = [];
    spdMod:		ModEntry[] = [];

    constructor(uid: string, character: CharacterData, owner: number) {
        this.uid       = uid;
        this.character = character;
        this.owner     = owner;
    }

    get phyRes(): number {
        return this.character.stats.physicalResistance;
    }

    get magRes(): number {
        return this.character.stats.magicalResistance;
    }
}