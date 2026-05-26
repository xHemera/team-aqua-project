import { GameState } from "./GameState/GameState";
import { advanceTurn, getActiveCharacter, initTurnQueue } from "./GameState/TurnSystem";
import { CharacterInstance, ModEntry } from "./Instances/CharacterInstance";
import { applyDamage, resolvePhyDamage } from "./Utils/resolveDamage";
import { GameAction } from "./Utils/GameAction";
import { checkLastStand } from "./Utils/lastStand";
import { findCharacter, resolveTargets } from "./Utils/resolveTargets";

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
}

function tickPoison(state: GameState): GameState {
	state.players.flatMap(p => p.characters).forEach(character => {
		const totalDamage   = character.poison.reduce((acc, { value }) => acc + value, 0);
		if (totalDamage > 0) {
			console.log(`[GameEngine] tickPoison — ${character.uid} takes ${totalDamage} poison damage (hp=${character.currentHp}→${Math.max(0, character.currentHp - totalDamage)})`);
		}
		applyDamage(character, totalDamage);
		character.poison    = character.poison
			.map(e => ({ ...e, turn: e.turn - 1 }))
			.filter(e => e.turn > 0);
	});
	return state;
}

function removeDeadCharacters(state: GameState): GameState {
	const updatedPlayers = state.players.map((player, pi) => {
		const alive = player.characters.filter(c => c.currentHp > 0);
		const dead = player.characters.filter(c => c.currentHp <= 0);
		if (dead.length > 0) {
			console.log(`[GameEngine] removeDeadCharacters — player ${pi}: ${dead.length} dead (${dead.map(c => `${c.uid} hp=${c.currentHp}`).join(", ")}), ${alive.length} alive`);
		}
		return { ...player, characters: alive };
	});

	const aliveUids    = new Set(updatedPlayers.flatMap(p => p.characters.map(c => c.uid)));
	const updatedQueue = state.turnQueue.filter(e => aliveUids.has(e.characterUid));

	return { ...state, players: updatedPlayers, turnQueue: updatedQueue };
}

function checkWinner(state: GameState): GameState {
	const charCounts = state.players.map(p => `${p.id}:${p.characters.length}`);
	const loser = state.players.find(p => p.characters.length === 0);
	if (!loser) return state;

	const winner = state.players.find(p => p !== loser);
	console.log(`[GameEngine] checkWinner — game end! remaining chars=${charCounts.join(",")} winnerId=${state.players.indexOf(winner!)}`);
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
	const user = findCharacter(state, action.userUid);

	if (!user) return state;

	if (user.invul     > 0) user.invul     -= 1;

	if (user.stunned > 0) {
		tickAllMods(user);
		return advanceTurn(state);
	}

	const targets = resolveTargets(state, user, action);
	if (targets.length === 0) return state;

	if (action.type === "basic") {
		resolveBasicAttack(user, targets);
	} else if (action.type === "skill" && action.skillId) {
		resolveSkill(action.skillId, user, targets);
	} else if (action.type === "skip") {
		user.currentMp = Math.min(
		user.character.stats.mp,
		user.currentMp + (user.character.stats.mp / 10)
	);
	}

	state.players
		.flatMap(p => p.characters)
		.forEach(c => checkLastStand(c));

	tickAllMods(user);

	let newState = tickPoison(state);
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