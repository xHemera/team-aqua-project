import { PokemonCard } from "../cards/PokemonCard";
import { GameState } from "../GameState";
import { PokemonInstance } from "../instances/PokemonInstance";

export function setupGame(state: GameState): GameState
{
	const newPlayers = state.players.map((_, i) => {
		const player = state.players[i];

		const shuffledDeck = [...player.deck].sort(() => Math.random() - 0.5);
		const drawnCards = shuffledDeck.slice(-7);
		const remainingDeck = shuffledDeck.slice(0, -7);

		const pokemonIndex = drawnCards.findIndex(c => c.card instanceof PokemonCard);
		if (pokemonIndex === -1) {
			throw new Error("No Pokemon in starting hand");
		}
	
		const activeCardInstance = drawnCards[pokemonIndex];
		const newHand = drawnCards.filter((_, j) => j ! == pokemonIndex);
		const newActive = new PokemonInstance(
			activeCardInstance.uid,
			activeCardInstance.card as PokemonCard,
			activeCardInstance.owner
		);
	
		return {
			...player,
			deck: remainingDeck,
			hand: newHand,
			active: newActive,
		};
	});

	return {
		...state,
		players: newPlayers
	};
}
