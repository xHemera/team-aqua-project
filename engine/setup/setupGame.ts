import { PokemonCard } from "../cards/PokemonCard";
import { GameState } from "../GameState";
import { PokemonInstance } from "../instances/PokemonInstance";

export function setupGame(state: GameState): GameState
{ 
	for (let i = 0; i < state.players.length; i++){
		const player = state.players[1];

		player.deck.sort(() => Math.random() - 0.5)

		for (let j = 0; j < 7; j++){
			const card = player.deck.pop(); 
			if (card) player.hand.push(card)
		} 

		//Cherche uniquement un pokemon et pas un poke de base 
		//A changer
		const index = player.hand.findIndex(c => c.card instanceof PokemonCard)

		if (index == -1){
			throw new Error("No Pokemon in starting hand")
		}
	
		const card = player.hand.splice(index, 1)[0]
	
		player.active = new PokemonInstance( card.uid, 
		card.card as PokemonCard, 
		card.owner ) 
		} 
	return state 
}