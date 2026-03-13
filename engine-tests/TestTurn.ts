import { Game } from "../engine/Game"
import { GameState } from "../engine/GameState"
import { PlayerState } from "../engine/player/PlayerState"

import { GameAction } from "../engine/actions/GameAction"

console.log("TEST TURN SYSTEM")

const player1 = new PlayerState()
const player2 = new PlayerState()

const state: GameState = {
	players: [player1, player2],
	activePlayer: 0,
	turn: 1
}

const game = new Game(state)

console.log("Start player:", game.state.activePlayer)
console.log("Turn:", game.state.turn)

const action: GameAction = {
	type: "END_TURN",
	player: 0
}

game.dispatch(action)

console.log("Next player:", game.state.activePlayer)
console.log("Turn:", game.state.turn)