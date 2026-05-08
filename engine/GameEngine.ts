import { GameState } from "./GameState/GameState";
import { advanceTurn, getActiveCharacter, initTurnQueue } from "./GameState/TurnSystem";
import { CharacterInstance, ModEntry } from "./Instances/CharacterInstance";
import { resolvePhyDamage } from "./Utils/resolveDamage";
import { GameAction } from "./Utils/GameAction";

function findCharacter(state: GameState, uid: string): CharacterInstance | undefined {
	return state.players
		.flatMap(p => p.characters)
		.find(c => c.uid === uid);
}

function tickAllMods(character: CharacterInstance): void {
	const tick = (mods: ModEntry[]) =>
		mods
			.map(e => ({ ...e, turn: e.turn -1 }))
			.filter(e => e.turn > 0);
	character.phyMod		= tick(character.phyMod);
	character.magMod		= tick(character.magMod);
	character.phyResMod 	= tick(character.phyResMod);
	character.magResMod		= tick(character.magResMod);
	character.critChanceMod	= tick(character.critChanceMod);
	character.critDamageMod = tick(character.critDamageMod);
	//calcul du dot de poison au debut de chaque tour
	character.poisonMod.forEach( instance => {
			character.currentHp = Math.max(0, character.currentHp - instance.value)
	});
	character.poisonMod = tick(character.poisonMod);
}

function removeDeadCharacters(state: GameState): GameState {
	const updatedPlayers = state.players.map(player => ({
		...player,
		characters: player.characters.filter(c => c.currentHp > 0),
	}));

	const aliveUids		= new Set(updatedPlayers.flatMap(p => p.characters.map(c => c.uid)));
	const updatedQueue	= state.turnQueue.filter(e => aliveUids.has(e.characterUid));

	return { ...state, players: updatedPlayers, turnQueue: updatedQueue};
}

function checkWinner(state: GameState): GameState {
	const loser = state.players.find(p => p.characters.length === 0);
	if (!loser) return state;

	const winner = state.players.find(p => p !== loser);
	return {
		...state,
		gamePhase:	"end",
		winnerId: state.players.indexOf(winner!)
	};
}

function resolveBasicAttack(user: CharacterInstance, targets: CharacterInstance[]): void {
	targets.forEach(target => {
		const raw 			= user.character.stats.physicalDamage;
		const damage		= resolvePhyDamage(raw, user, target);
		target.currentHp 	= Math.max(0, target.currentHp - damage);
	});

	user.currentMp 	= Math.min(
		user.character.stats.mp,
		user.currentMp + (user.character.stats.mp / 10)
	);
}

function resolveSkill(skillId: string, user: CharacterInstance, targets: CharacterInstance[]): void {
	const spell = user.spells.get(skillId);
	if (!spell) return;

	if (user.currentMp < spell.mpCost) return;
	user.currentMp -= spell.mpCost;

	spell.applyEffect(user, targets);
}

export function initGame(state: GameState): GameState {
	const turnQueue = initTurnQueue(state);
	return { ...state, gamePhase: "battle", turnQueue};
}

export function processAction(state: GameState, action: GameAction): GameState {
	const user		= findCharacter(state, action.userUid);
	const targets	= action.targetUids
		.map(uid => findCharacter(state, uid))
		.filter((c):c is CharacterInstance => c !== undefined);

	if (!user || targets.length === 0) return state;

	if (action.type === "basic") {
		resolveBasicAttack(user, targets);
	} else if (action.type === "skill" && action.skillId) {
		resolveSkill(action.skillId, user, targets);
	}

	tickAllMods(user);

	let newState = removeDeadCharacters(state);
		newState = checkWinner(newState);
	
	if (newState.gamePhase === "end") return newState;

	newState = advanceTurn(newState);

	return newState;
}

export function getCurrentTurnCharacter(state: GameState): CharacterInstance | undefined {
	const entry = getActiveCharacter(state);
	return findCharacter(state, entry.characterUid);
}
