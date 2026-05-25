import { GameState } from "./GameState/GameState";
import { advanceTurn, getActiveCharacter, initTurnQueue } from "./GameState/TurnSystem";
import { CharacterInstance, ModEntry } from "./Instances/CharacterInstance";
import { applyDamage, resolvePhyDamage } from "./Utils/resolveDamage";
import { GameAction } from "./Utils/GameAction";
import { checkLastStand } from "./Utils/lastStand";
import { findCharacter, resolveTargets } from "./Utils/resolveTargets";
import { stat } from "fs";

function tickAllMods(character: CharacterInstance): void {
	const tick = (mods: ModEntry[]) =>
		mods
			.map(e => ({ ...e, turn: e.turn - 1 }))
			.filter(e => e.turn > 0);

	character.phyMod		= tick(character.phyMod);
	character.magMod		= tick(character.magMod);
	character.phyResMod		= tick(character.phyResMod);
	character.magResMod		= tick(character.magResMod);
	character.critChanceMod	= tick(character.critChanceMod);
	character.critDamageMod	= tick(character.critDamageMod);

	if (character.stunned   > 0) character.stunned   -= 1;
	if (character.invisible > 0) character.invisible -= 1;
	if (character.taunted   > 0) character.taunted   -= 1;
	if (character.invul     > 0) character.invul     -= 1;
}

function tickPoison(state: GameState): GameState {
	state.players.flatMap(p => p.characters).forEach(character => {
		const totalDamage   = character.poison.reduce((acc, { value }) => acc + value, 0);
		applyDamage(character, totalDamage);
		character.poison    = character.poison
			.map(e => ({ ...e, turn: e.turn - 1 }))
			.filter(e => e.turn > 0);
	});
	return state;
}

function removeDeadCharacters(state: GameState): GameState {
	const updatedPlayers = state.players.map(player => ({
		...player,
		characters: player.characters.filter(c => c.currentHp > 0),
	}));

	const aliveUids    = new Set(updatedPlayers.flatMap(p => p.characters.map(c => c.uid)));
	const updatedQueue = state.turnQueue.filter(e => aliveUids.has(e.characterUid));

	return { ...state, players: updatedPlayers, turnQueue: updatedQueue };
}

function checkWinner(state: GameState): GameState {
	const loser = state.players.find(p => p.characters.length === 0);
	if (!loser) return state;

	const winner = state.players.find(p => p !== loser);
	return {
		...state,
		gamePhase: "end",
		winnerId:  state.players.indexOf(winner!),
	};
}

function resolveBasicAttack(user: CharacterInstance, targets: CharacterInstance[]): void {
	targets.forEach(target => {
		const raw    = user.character.stats.physicalDamage;
		const damage = resolvePhyDamage(raw, user, target);
		applyDamage(target, damage);
	});

	user.currentMp = Math.min(
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

export function processAction(state: GameState, action: GameAction): GameState {
	const character = findCharacter(state, action.userUid);

	if (!character) return state;

	if (character.stunned > 0) {
		tickAllMods(character);
		return advanceTurn(state);
	}
	tickAllMods(character);

	let	newState =tickPoison(state);
		newState = removeDeadCharacters(newState);
		newState = checkWinner(newState);

	const targets = resolveTargets(newState, character, action);
	if (targets.length === 0) return newState;

	if (action.type === "basic") {
		resolveBasicAttack(character, targets);
	} else if (action.type === "skill" && action.skillId) {
		resolveSkill(action.skillId, character, targets);
	} else if (action.type === "skip") {
		character.currentMp = Math.min(
		character.character.stats.mp,
		character.currentMp + (character.character.stats.mp / 10)
	);
	}

	newState.players
		.flatMap(p => p.characters)
		.forEach(c => checkLastStand(c));

		newState = removeDeadCharacters(newState);
		newState = checkWinner(newState);

	if (newState.gamePhase === "end") return newState;

	newState = advanceTurn(newState);
	return newState;
}

export function getCurrentTurnCharacter(state: GameState): CharacterInstance | undefined {
	const entry = getActiveCharacter(state);
	return findCharacter(state, entry.characterUid);
}