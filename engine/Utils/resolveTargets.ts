import { GameState } from "../GameState/GameState";
import { CharacterInstance } from "../Instances/CharacterInstance";
import { GameAction } from "./GameAction";

export function findCharacter(state: GameState, uid: string): CharacterInstance | undefined {
  return state.players
    .flatMap(p => p.characters)
    .find(c => c.uid === uid);
}


export function resolveTargets(
  state:    GameState,
  user:     CharacterInstance,
  action:   GameAction
): CharacterInstance[] {
  const enemies = state.players
    .filter(p => p.id !== user.owner)
    .flatMap(p => p.characters);

  const tauntedKnight = enemies.find(e => e.taunted > 0);

  const rawTargets = action.targetUids
    .map(uid => findCharacter(state, uid))
    .filter((c): c is CharacterInstance => c !== undefined);

  if (!tauntedKnight) return rawTargets;

  const targetsEnemies = rawTargets.some(t => t.owner !== user.owner);
  if (!targetsEnemies) return rawTargets;

  return [tauntedKnight];
}