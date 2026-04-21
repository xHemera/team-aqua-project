import { PlayerInstance } from "../Instances/PlayerInstance"

export type GameState = {
	players: PlayerInstance[]

	activePlayer: number
	turn: number
}