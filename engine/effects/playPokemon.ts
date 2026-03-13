import { PokemonCard } from "../cards/PokemonCard";
import { GameState } from "../GameState";
import { CardInstance } from "../instances/CardInstance";
import { PokemonInstance } from "../instances/PokemonInstance";

//Permet de deplacer un pokemon depuis la main vers le banc
export function playPokemon(
	state: GameState,
	playerIndex: number,
	cardUid: string
): GameState {
	const player = state.players[playerIndex]
	const handIndex = player.hand.findIndex(c => c.uid === cardUid)
	if (handIndex === -1) {
		throw new Error("Card not in hand")
	}
	const CardInstance = player.hand[handIndex]
	if (!(CardInstance.card instanceof PokemonCard)) {
		throw new Error("Card is not a Pokemon")
	}
	player.hand.splice(handIndex, 1)
	const pokemon = new PokemonInstance(
		CardInstance.uid,
		CardInstance.card,
		CardInstance.owner
	)
	player.bench.push(pokemon)
	return state
}