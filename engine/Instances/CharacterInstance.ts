export class CharacterInstance {
	uid: 		string
	character:	CharacterData
	owner:		number

	constructor(uid: string, character: CharacterData, owner: number){
		this.uid = uid
		this.character = character
		this.owner = owner
	}
}