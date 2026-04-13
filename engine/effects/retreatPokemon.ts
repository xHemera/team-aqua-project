import { PokemonCard } from "../cards/PokemonCard";
import { GameState } from "../GameState";
import { PokemonInstance } from "../instances/PokemonInstance";
import { playActive } from "./playPokemon";


//Permet de deplacer un pokemon vers le banc et ducoup en place un nouveau en actif
//Recupere l'id du pokemon a deplacer en actif dans cardUid
export function retreatPokemon(
	state: GameState,
	playerIndex: number,
	cardUid: string ,
): GameState {
	const player = state.players[playerIndex]
	if (player.active) {
		const pokemon = new PokemonInstance(
			player.active.uid,
			player.active.card,
			player.active.owner
		)
		player.bench.push(pokemon);
	}
	state = playActive(state, playerIndex, cardUid);
	return state;
}
