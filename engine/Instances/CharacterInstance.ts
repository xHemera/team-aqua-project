export class CharacterInstance {
	uid: 		string
	character:	CharacterData
	owner:		number
	phyMod:		number[] = []
	phyTurn:	number[] = []
	magMod:		number[] = []
	magTurn:	number[] = []
	defMod:		number[] = []
	defTurn:	number[] = []
	defMMod:	number[] = []
	defMTurn:	number[] = []
	spdMod:		number[] = []
	spdTMod:	number[] = []

	constructor(uid: string, character: CharacterData, owner: number){
		this.uid = uid
		this.character = character
		this.owner = owner
	}
}