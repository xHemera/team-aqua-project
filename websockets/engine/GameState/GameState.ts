import { PlayerInstance } from "../Instances/PlayerInstance";
import { TurnEntry } from "./TurnSystem";
import { DamageEvent } from "../Utils/resolveDamage";

export type GamePhase = "draft" | "battle" | "end";

export type GameState = {
	players: 		PlayerInstance[];
	activePlayer:	number;
	turn:			number;
	turnQueue:		TurnEntry[];
	gamePhase:		GamePhase;
	winnerId?:		number;
	damageEvents:	DamageEvent[];
}