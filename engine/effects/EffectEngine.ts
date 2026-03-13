import { GameAction } from "../actions/GameAction"
import { GameState } from "../GameState"
import { drawCard, endTurn } from "./GameEffects"

export class EffectEngine {
	static execute(state: GameState, action: GameAction): GameState {
		switch(action.type) {
			case "DRAW_CARD":
				return drawCard(state, action.player)
			
			case "END_TURN":
				return endTurn(state)
			
			default:
				return state
		}
	}
}