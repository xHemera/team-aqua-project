import { getCurrentTurnCharacter, processAction} from "../GameEngine";
import { GameAction } from "../Utils/GameAction";
import { GameState } from "./GameState"
import { initGame } from "./initGameState";

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

	submitAction(action: GameAction): GameLoopState {
		if (this.state.gamePhase !== "battle") return this.getLoopState();

		const activeCharacter = getCurrentTurnCharacter(this.state);
		if (!activeCharacter || activeCharacter.uid !== action.userUid) {
		return this.getLoopState();
		}

		this.state = processAction(this.state, action);
		return this.getLoopState();
	}
	}