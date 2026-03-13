import { PlayerState } from "./player/PlayerState"

export type GameState = {
	players: PlayerState[]

	activePlayer: number
	turn: number
}