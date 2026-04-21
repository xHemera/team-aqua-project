export interface ModEntry {
    value: number;
    turn:  number;
}

export class CharacterInstance {
    uid:       string;
    character: CharacterData;
    owner:     number;
    phyMod:    ModEntry[] = [];
    magMod:    ModEntry[] = [];
    defMod:    ModEntry[] = [];
    defMMod:   ModEntry[] = [];
    spdMod:    ModEntry[] = [];

    constructor(uid: string, character: CharacterData, owner: number) {
        this.uid       = uid;
        this.character = character;
        this.owner     = owner;
    }
}