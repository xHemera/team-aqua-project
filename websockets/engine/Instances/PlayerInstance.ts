import { CharacterInstance } from "./CharacterInstance";

export class PlayerInstance {
	characters: CharacterInstance[] = []
	timer:		number;
	id:			number;

	constructor(id: number){
		this.timer	= 0;
		this.id		= id;
	}
}