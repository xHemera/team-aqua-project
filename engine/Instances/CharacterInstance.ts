import { Character } from "../Characters"

export class CharacterInstance {
	uid: 		string
	character:	Character
	owner:		number

	constructor(uid: string, character: Character, owner: number){
		this.uid = uid
		this.character = character
		this.owner = owner
	}
}