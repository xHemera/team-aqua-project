import { GameState } from "../GameState.ts"

export function drawCard(state: GameState, playerIndex: number): GameState {
	const player = state.players[playerIndex]
	const card = player.deck.pop()
	if (card)
		player.hand.push(card)
	return state
}

export function endTurn(state: GameState): GameState {
	state.activePlayer =
		(state.activePlayer + 1) % state.players.length
	state.turn += 1
	return state
}