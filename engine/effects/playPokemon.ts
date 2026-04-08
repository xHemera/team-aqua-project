import { PokemonCard } from "../cards/PokemonCard";
import { GameState } from "../GameState";
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

//Permet de deplacer un pokemon depuis le banc vers la main
export function	playActive(
	state: GameState,
	playerIndex: number,
	cardUid: string
): GameState {
	const player = state.players[playerIndex]
	const benchIndex = player.bench.findIndex(c => c.uid === cardUid)
	if (benchIndex === -1) {
		throw new Error("Card not on Bench")
	}
	const CardInstance = player.bench[benchIndex]
	if (!(CardInstance.card instanceof PokemonCard)) {
		throw new Error("Card is not a Pokemon")
	}
	player.bench.splice(benchIndex, 1)
	const pokemon = new PokemonInstance(
		CardInstance.uid,
		CardInstance.card,
		CardInstance.owner
	)
	player.active = pokemon
	return state
}