import { GameAction } from "./actions/GameAction"
import { EffectEngine } from "./effects/EffectEngine"
import { GameState } from "./GameState"

export class Game {
	state: GameState

	constructor(state: GameState) {
		this.state = state
	}

	dispatch(action: GameAction) {

		this.state = EffectEngine.execute(this.state, action)
	}
}