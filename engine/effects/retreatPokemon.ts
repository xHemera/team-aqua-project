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

	const newBench = player.active
	? [
		...player.bench,
		new PokemonInstance(
			player.active.uid,
			player.active.card,
			player.active.owner
		),
	  ]	
	: [...player.bench];

	const stateWithBech: GameState = {
		...state,
		players: state.players.map((p, i) =>
		 i === playerIndex ? { ...p, bench: newBench} : p
		),
	};

	return playActive(stateWithBech, playerIndex, cardUid);
}
