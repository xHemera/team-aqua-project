import { PlayerInstance } from "./PlayerInstance"

export type GameState = {
	players: PlayerInstance[]

	activePlayer: number
	turn: number
}