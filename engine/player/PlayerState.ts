import { CardInstance } from "../instances/CardInstance"
import { PokemonInstance } from "../instances/PokemonInstance"

export class PlayerState {
	deck: CardInstance[] = []
	hand: CardInstance[] = []
	discard: CardInstance[] = []

	active: PokemonInstance | null = null
	bench: PokemonInstance[] = []

	prizes: CardInstance[] = []
}