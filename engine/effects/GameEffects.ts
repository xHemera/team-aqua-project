import { GameState } from "../GameState"

export function drawCard(state: GameState, playerIndex: number): GameState {
	const player = state.players[playerIndex]

	if (player.deck.length === 0) {
		console.log("Player", playerIndex, "loses: deck empty")
	}

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