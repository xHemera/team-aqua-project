import { CharacterInstance } from "./CharacterInstance";

export class PlayerInstance {
	characters: CharacterInstance[] = []
	timer:		number;

	constructor(){
		this.timer = 0;
	}
}