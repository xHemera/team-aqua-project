import { CardInstance } from "../instances/CardInstance.ts"
import { PokemonInstance } from "../instances/PokemonInstance.ts"

export class PlayerState {
	deck: CardInstance[] = []
	hand: CardInstance[] = []
	discard: CardInstance[] = []

	active: PokemonInstance | null = null
	bench: PokemonInstance[] = []

	prizes: CardInstance[] = []
}