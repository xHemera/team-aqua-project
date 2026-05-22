console.log("START");

import { GameLoop, GameLoopState } from "./GameState/GameLoop";
import { initGameState, Team } from "./GameState/initGameState";
import * as readline from "readline";

const teamA: Team = {
  owner:       "player0",
  characters:  ["archer", "knight", "healer"],
  levels:      [5, 5, 5],
  skillLevels: [3, 3, 3,  3, 3, 3,  3, 3, 3],
};

const teamB: Team = {
  owner:       "player1",
  characters:  ["mage", "assassin", "knight"],
  levels:      [5, 5, 5],
  skillLevels: [3, 3, 3,  3, 3, 3,  3, 3, 3],
};

const loop = new GameLoop(initGameState(teamA, teamB));

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise(resolve => rl.question(question, resolve));
}

function printState() {
  const { gameState } = loop.getLoopState();
  console.log("\n=============================");
  gameState.players.forEach((p, i) => {
    console.log(`\nJoueur ${i}:`);
    p.characters.forEach((c, idx) => {
      const status = [
        c.stunned   > 0 ? `STUN(${c.stunned})`     : "",
        c.taunted   > 0 ? `TAUNT(${c.taunted})`    : "",
        c.invisible > 0 ? `INVIS(${c.invisible})`  : "",
        c.shieldHp  > 0 ? `SHIELD(${Math.round(c.shieldHp)})` : "",
        c.overHp    > 0 ? `OVERHP(${Math.round(c.overHp)})`   : "",
      ].filter(Boolean).join(" ");

      console.log(
        `  [${idx}] ${c.character.name.padEnd(12)} HP:${Math.round(c.currentHp)}/${c.character.stats.hp} MP:${Math.round(c.currentMp)}/${c.character.stats.mp} ${status}`
      );
    });
  });
  console.log("=============================\n");
}

async function playTurn() {
  const loopState = loop.getLoopState();

  if (loopState.winner !== undefined) {
    console.log(`\n=== FIN — Joueur ${loopState.winner} gagne ===`);
    rl.close();
    return;
  }

  const user = loopState.gameState.players
    .flatMap(p => p.characters)
    .find(c => c.uid === loopState.activeCharacterUid)!;

  const enemies = loopState.gameState.players
    .filter(p => p.id !== user.owner)
    .flatMap(p => p.characters);

  const allies = loopState.gameState.players
    .filter(p => p.id === user.owner)
    .flatMap(p => p.characters);

  printState();
  console.log(`Tour ${loopState.gameState.turn} — Joueur ${user.owner} — ${user.character.name}`);

  // Choix action
  console.log("\nActions:");
  console.log("  [0] Attaque basique");
  user.spells.forEach((spell, id) => {
    console.log(`  [${id}] ${spell.name} (MP: ${spell.mpCost}) — ${spell.targeting}`);
  });

  const actionInput = await ask("\nChoisir action (0 / s1 / s2 / s3): ");

  let targetUids: string[] = [];

  if (actionInput === "0") {
    // Attaque basique — choisir une cible ennemie
    console.log("\nCibles ennemies:");
    enemies.forEach((e, i) => console.log(`  [${i}] ${e.character.name} HP:${Math.round(e.currentHp)}`));

    const targetInput = await ask("Choisir cible: ");
    const target = enemies[parseInt(targetInput)];
    if (!target) { console.log("Cible invalide"); return playTurn(); }

    targetUids = [target.uid];
    loop.submitAction({ type: "basic", userUid: user.uid, targetUids });

  } else {
    const spell = user.spells.get(actionInput);
    if (!spell) { console.log("Skill invalide"); return playTurn(); }
    if (user.currentMp < spell.mpCost) { console.log("Pas assez de MP"); return playTurn(); }

    if (spell.targeting === "single") {
      const pool = enemies;
      console.log("\nCibles:");
      pool.forEach((e, i) => console.log(`  [${i}] ${e.character.name} HP:${Math.round(e.currentHp)}`));
      const targetInput = await ask("Choisir cible: ");
      const target = pool[parseInt(targetInput)];
      if (!target) { console.log("Cible invalide"); return playTurn(); }
      targetUids = [target.uid];

    } else if (spell.targeting === "aoe") {
      targetUids = enemies.map(e => e.uid);

    } else if (spell.targeting === "self") {
      targetUids = [user.uid];

    } else if (spell.targeting === "teamAoe") {
      targetUids = allies.map(c => c.uid);
    }

    loop.submitAction({ type: "skill", skillId: actionInput, userUid: user.uid, targetUids });
  }

  playTurn();
}

playTurn();