import { PlayerInstance } from "../Instances/PlayerInstance";
import { TurnEntry } from "./TurnSystem";

export type GameState = {
	players: 		PlayerInstance[];
	activePlayer:	number;
	turn:			number;
	turnQueue:		TurnEntry[];
}