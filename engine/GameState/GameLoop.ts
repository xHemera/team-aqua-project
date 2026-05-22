import { getCurrentTurnCharacter} from "../GameEngine";
import { GameState } from "./GameState"
import { initGame } from "./initGame";

export type GameLoopState = {
	gameState:			GameState;
	activePlayerOwner:	number;
	activeCharacterUid:	string;
	waitingForAction:	boolean;
	winner?:			number;
}

export class GameLoop {
	private state: GameState;

	constructor(initialState: GameState) {
		this.state = initGame(initialState);
	}

	getLoopState(): GameLoopState {
		const activeCharacter = getCurrentTurnCharacter(this.state);

		return {
		gameState:          this.state,
		activePlayerOwner:  activeCharacter?.owner ?? 0,
		activeCharacterUid: activeCharacter?.uid   ?? "",
		waitingForAction:   this.state.gamePhase === "battle",
		winner:             this.state.winnerId,
		};
	}
}