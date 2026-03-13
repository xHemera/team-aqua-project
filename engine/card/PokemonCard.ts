import { Card } from "./Card";
import { CardType } from "./CardType";

export class PokemonCard extends Card {
	hp: number
	stage: number
	// element: ElementType
	// attacks: Attack[]

	constructor(
		id: string,
		name: string,
		hp: number,
		stage: number,
		// element: ElementType,
		// attacks: Attack[]
	) {
		super(id, name, CardType.POKEMON)

		this.hp = hp
		this.stage = stage
		// this.element = element
		// this.attacks = attacks
	}
}