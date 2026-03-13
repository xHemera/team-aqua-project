import { PlayerState } from "./player/PlayerState.ts"

export type GameState = {
	players: PlayerState[]

	activePlayer: number
	turn: number
}