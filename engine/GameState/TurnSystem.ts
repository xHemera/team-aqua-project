import { CharacterInstance } from "../Instances/CharacterInstance";
import { Game } from "./Game";
import { GameState } from "./GameState";

export type TurnEntry = {
	characterUid: 	string;
	playerOwner: 	number;
	charge:			number;
}

const	TURN_THRESHOLD = 200;

function sortQueue(queue: TurnEntry[]): TurnEntry[] {
    return [...queue].sort((a, b) => a.charge - b.charge);
}

export function initTurnQueue(state: GameState): TurnEntry[] {
	const allCharacters = state.players.flatMap(players => 
		players.characters.map(character => ({
			characterUid:	character.uid,
			playerOwner:	character.owner,
			charge:			TURN_THRESHOLD - character.character.stats.speed,
		}))
	);

	return sortQueue(allCharacters);
}

export function getActiveCharacter(state: GameState): TurnEntry {
	return state.turnQueue[0];
}

function findCharacter(state: GameState, uid: string): CharacterInstance | undefined {
    return state.players
        .flatMap(p => p.characters)
        .find(c => c.uid === uid);
}

export function advanceTurn(state: GameState): GameState {
    const [current, ...rest] = state.turnQueue;

    const character = findCharacter(state, current.characterUid);
    const speed     = character?.character.stats.speed ?? 1;

    const requeued: TurnEntry = {
        ...current,
        charge: TURN_THRESHOLD - speed,
    };

    const updated = rest.map(entry => ({
        ...entry,
        charge: entry.charge - requeued.charge,
    }));

    const newQueue = sortQueue([...updated, { ...requeued, charge: requeued.charge }]);

    return {
        ...state,
        turn:      state.turn + 1,
        turnQueue: newQueue,
    };
}