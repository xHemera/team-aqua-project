import { GameAction } from "../actions/GameAction"
import { GameState } from "../GameState"
import { drawCard, endTurn } from "./GameEffects"
import { playActive, playPokemon } from "./playPokemon"
import { retreatPokemon } from "./retreatPokemon"

export class EffectEngine {
	static execute(state: GameState, action: GameAction): GameState {
		switch(action.type) {
			case "DRAW_CARD":
				return drawCard(state, action.player)
			
			case "END_TURN":
				return endTurn(state)
			
			case "PLAY_POKEMON":
				return playPokemon(state, action.player, action.cardUid)

			case "PLAY_ACTIVE" :
				return playActive(state, action.player, action.cardUid)		

			case "RETREAT_POKEMON":
				return retreatPokemon(state, action.player, action.cardUid)
			default:
				return state
		}
	}
}