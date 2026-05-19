import { CharacterInstance, ModEntry } from "../Instances/CharacterInstance";
import { applyCrit, rollCrit } from "./crit";

function applyAndTick(mods: ModEntry[], raw: number): { result: number; mods: ModEntry[] } {
	const totalMod = mods.reduce((acc, { value }) => acc + value, 0);
	const result   = raw * (1 + totalMod / 100); // selon ta convention
    return {
        result,
        mods: mods
            .map(entry => ({ ...entry, turn: entry.turn - 1 }))
            .filter(entry => entry.turn > 0),
    };
}

function applyResistance(damage: number, baseRes: number, resMods: ModEntry[]): { result: number; mods: ModEntry[] } {
    const totalRes = resMods.reduce((acc, { value }) => acc + value, baseRes);
    const result   = damage * (100 / (100 + totalRes));
    return {
        result,
        mods: resMods
            .map(entry => ({ ...entry, turn: entry.turn - 1 }))
            .filter(entry => entry.turn > 0),
    };
}

export function resolvePhyDamage(
    raw: number,
    idUser: CharacterInstance,
    idTarget: CharacterInstance,
    resOverride?: number  // optionnel, remplace phyRes si fourni
): number {
    const { result: afterUser,   mods: newPhyMod    } = applyAndTick(idUser.phyMod, raw);
    const baseRes = resOverride ?? idTarget.phyRes;
    const { result: afterTarget, mods: newPhyResMod } = applyResistance(afterUser, baseRes, idTarget.phyResMod);

    idUser.phyMod      = newPhyMod;
    idTarget.phyResMod = newPhyResMod;

    const isCrit   = rollCrit(idUser);
    const finalDmg = isCrit ? applyCrit(afterTarget, idUser) : afterTarget;

    return finalDmg;
}

export function resolveMagDamage(
    raw: number,
    idUser: CharacterInstance,
    idTarget: CharacterInstance,
    resOverride?: number
): number {
    const { result: afterUser,   mods: newMagMod    } = applyAndTick(idUser.magMod, raw);
    const baseRes = resOverride ?? idTarget.magRes;
    const { result: afterTarget, mods: newMagResMod } = applyResistance(afterUser, baseRes, idTarget.magResMod);

    idUser.magMod      = newMagMod;
    idTarget.magResMod = newMagResMod;

    const isCrit   = rollCrit(idUser);
    const finalDmg = isCrit ? applyCrit(afterTarget, idUser) : afterTarget;

    return finalDmg;
}

export function applyDamage(target: CharacterInstance, damage: number): void {
	if (target.invul > 0) {
		return;
	}

	if (target.overHp > 0) {
		const absorbed = Math.min(target.overHp, damage);
		target.overHp -= absorbed;
		damage        -= absorbed;
	}
	target.currentHp = Math.max(0, target.currentHp - damage);
}
