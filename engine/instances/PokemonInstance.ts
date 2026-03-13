import { PokemonCard } from "../card/PokemonCard.ts";
import { CardInstance } from "./CardInstance.ts";

export class PokemonInstance extends CardInstance {
	card: PokemonCard

	damage: number = 0
	constructor(uid: string, card:PokemonCard, owner: number) {
		super(uid, card, owner)
		this.card = card
	}
}