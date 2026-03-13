import { GameAction } from "./actions/GameAction.ts"
import { EffectEngine } from "./effects/EffectEngine.ts"
import { GameState } from "./GameState.ts"

export class Game {
	state: GameState

	constructor(state: GameState) {
		this.state = state
	}

	dispatch(action: GameAction) {

		this.state = EffectEngine.execute(this.state, action)
	}
}