console.log("START");

import { GameLoop } from "./GameState/GameLoop";
import { initGameState, Team } from "./GameState/initGameState";
import { archer } from "./heroes/archer";
import { getValidTargets } from "./Utils/resolveTargets";
import * as readline from "readline";

const teamA: Team = {
  owner:       "player0",
  characters:  ["healer", "assassin", "archer"],
  levels:      [5, 5, 5],
  skillLevels: [3, 3, 3, 3, 3, 3],
};

const teamB: Team = {
  owner:       "player1",
  characters:  ["mage", "healer", "knight"],
  levels:      [5, 5, 5],
  skillLevels: [3, 3, 3, 3, 3, 3],
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
  const allChars = gameState.players.flatMap(p => p.characters);

  console.log("\n=============================");

  gameState.players.forEach((p, i) => {
    console.log(`\nJoueur ${i}:`);
    p.characters.forEach((c) => {
      const status = [
        c.stunned   > 0 ? `STUN(${c.stunned})`                  : "",
        c.taunted   > 0 ? `TAUNT(${c.taunted})`                 : "",
        c.invisible > 0 ? `INVIS(${c.invisible})`               : "",
        c.shieldHp  > 0 ? `SHIELD(${Math.round(c.shieldHp)})`   : "",
        c.overHp    > 0 ? `OVERHP(${Math.round(c.overHp)})`     : "",
      ].filter(Boolean).join(" ");

      const hpPct = Math.round((c.currentHp / c.character.stats.hp) * 10);
      const mpPct = Math.round((c.currentMp / c.character.stats.mp) * 10);
      const hpBar = `[${"█".repeat(hpPct)}${"░".repeat(10 - hpPct)}]`;
      const mpBar = `[${"█".repeat(mpPct)}${"░".repeat(10 - mpPct)}]`;

      console.log(
        `  ${c.character.name.padEnd(12)} ` +
        `HP${hpBar}${Math.round(c.currentHp).toString().padStart(5)}/${c.character.stats.hp} ` +
        `MP${mpBar}${Math.round(c.currentMp).toString().padStart(4)}/${c.character.stats.mp}` +
        (status ? `  ${status}` : "")
      );

      const effects: string[] = [];
      if (c.phyMod.length)        effects.push(`phyMod:     ${c.phyMod.map(e        => `+${e.value}(${e.turn}t)`).join(" ")}`);
      if (c.magMod.length)        effects.push(`magMod:     ${c.magMod.map(e        => `+${e.value}(${e.turn}t)`).join(" ")}`);
      if (c.phyResMod.length)     effects.push(`phyResMod:  ${c.phyResMod.map(e     => `+${e.value}(${e.turn}t)`).join(" ")}`);
      if (c.magResMod.length)     effects.push(`magResMod:  ${c.magResMod.map(e     => `+${e.value}(${e.turn}t)`).join(" ")}`);
      if (c.critChanceMod.length) effects.push(`critChance: ${c.critChanceMod.map(e => `+${e.value}(${e.turn}t)`).join(" ")}`);
      if (c.critDamageMod.length) effects.push(`critDamage: ${c.critDamageMod.map(e => `+${e.value}(${e.turn}t)`).join(" ")}`);
      if (c.poison.length)        effects.push(`poison:     ${c.poison.map(e        => `${e.value}dmg(${e.turn}t)`).join(" ")}`);
      if (effects.length) {
        effects.forEach(e => console.log(`             └ ${e}`));
      }
    });
  });

  console.log("\n--- File d'attente ---");
  gameState.turnQueue.slice(0, 6).forEach((entry, i) => {
    const char  = allChars.find(c => c.uid === entry.characterUid);
    const name  = char?.character.name.padEnd(12) ?? entry.characterUid;
    const owner = char?.owner ?? "?";
    const arrow = i === 0 ? " ◄ ACTIF" : "";
    console.log(`  ${i + 1}. J${owner} ${name} (charge: ${Math.round(entry.charge)})${arrow}`);
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

  const validTargets = getValidTargets(loopState.gameState, user);
  const allies       = loopState.gameState.players
    .filter(p => p.id === user.owner)
    .flatMap(p => p.characters);

  // Skip obligatoire si aucune cible visible et aucun spell allié/self
  const hasActionableSpell = [...user.spells.values()].some(s =>
    s.targeting === "teamSingle" || s.targeting === "teamAoe" || s.targeting === "self"
  );
  const mustSkip = validTargets.length === 0 && !hasActionableSpell;

  printState();
  console.log(`Tour ${loopState.gameState.turn} — Joueur ${user.owner} — ${user.character.name}`);

  if (mustSkip) {
    console.log("Aucune cible disponible — tour passé automatiquement (regen MP).");
    loop.submitAction({ type: "skip", userUid: user.uid, targetUids: [] });
    return playTurn();
  }

  console.log("\nActions:");
  console.log("  [skip] Passer le tour (regen MP)");
  console.log("  [0] Attaque basique");
  user.spells.forEach((spell, id) => {
    const mpOk = user.currentMp >= spell.mpCost ? "" : " [MP insuffisant]";
    console.log(`  [${id}] ${spell.name} (MP: ${spell.mpCost}) — ${spell.targeting}${mpOk}`);
  });

  const actionInput = await ask("\nChoisir action (skip / 0 / s1 / s2 / s3): ");
  let targetUids: string[] = [];

  if (actionInput === "skip") {
    loop.submitAction({ type: "skip", userUid: user.uid, targetUids: [] });

  } else if (actionInput === "0") {
    if (validTargets.length === 0) {
      console.log("Aucune cible disponible.");
      return playTurn();
    }
    console.log("\nCibles ennemies:");
    validTargets.forEach((e, i) => console.log(`  [${i}] ${e.character.name} HP:${Math.round(e.currentHp)}`));
    const targetInput = await ask("Choisir cible: ");
    const target = validTargets[parseInt(targetInput)];
    if (!target) { console.log("Cible invalide"); return playTurn(); }
    targetUids = [target.uid];
    loop.submitAction({ type: "basic", userUid: user.uid, targetUids });

  } else {
    const spell = user.spells.get(actionInput);
    if (!spell)                        { console.log("Skill invalide");   return playTurn(); }
    if (user.currentMp < spell.mpCost) { console.log("Pas assez de MP"); return playTurn(); }

    if (spell.targeting === "single") {
      if (validTargets.length === 0) {
        console.log("Aucune cible disponible.");
        return playTurn();
      }
      console.log("\nCibles:");
      validTargets.forEach((e, i) => console.log(`  [${i}] ${e.character.name} HP:${Math.round(e.currentHp)}`));
      const targetInput = await ask("Choisir cible: ");
      const target = validTargets[parseInt(targetInput)];
      if (!target) { console.log("Cible invalide"); return playTurn(); }
      targetUids = [target.uid];

    } else if (spell.targeting === "aoe") {
      targetUids = validTargets.map(e => e.uid);

    } else if (spell.targeting === "self") {
      targetUids = [user.uid];

    } else if (spell.targeting === "teamAoe") {
      targetUids = allies.map(c => c.uid);

    } else if (spell.targeting === "teamSingle") {
      console.log("\nCibles alliées:");
      allies.forEach((a, i) => console.log(`  [${i}] ${a.character.name} HP:${Math.round(a.currentHp)}`));
      const targetInput = await ask("Choisir cible: ");
      const target = allies[parseInt(targetInput)];
      if (!target) { console.log("Cible invalide"); return playTurn(); }
      targetUids = [target.uid];
    }

    loop.submitAction({ type: "skill", skillId: actionInput, userUid: user.uid, targetUids });
  }

  playTurn();
}

playTurn();