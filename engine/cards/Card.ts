import { CardType } from "./CardType"

export class Card {
	id: 	string
	name: 	string
	type:	CardType

	constructor(id: string, name: string, type: CardType) {
		this.id = id
		this.name = name
		this.type = type
	}
}