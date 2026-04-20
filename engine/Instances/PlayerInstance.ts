import { Character } from "../Characters";

export class PlayerInstance {
	characters: Character[] = []
	timer:		number;

	constructor(){
		this.timer = 0;
	}
}