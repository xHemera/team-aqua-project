import { GameState } from "../GameState"

export function drawCard(state: GameState, playerIndex: number): GameState {
	const player = state.players[playerIndex]

	if (player.deck.length === 0) {
		console.log("Player", playerIndex, "loses: deck empty")
		return state;
	}

	const card = player.deck[player.deck.length - 1]
	player.deck = player.deck.slice(0, -1)

	player.hand = [...player.hand, card]
	return state
}

export function endTurn(state: GameState): GameState {
	state.activePlayer =
		(state.activePlayer + 1) % state.players.length
	state.turn += 1
	return state
}