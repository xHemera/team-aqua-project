import { PokemonCard } from "../card/PokemonCard";
import { CardInstance } from "./CardInstance";

export class PokemonInstance extends CardInstance {
	card: PokemonCard

	damage: number = 0
	constructor(uid: string, card:PokemonCard, owner: number) {
		super(uid, card, owner)
		this.card = card
	}
}