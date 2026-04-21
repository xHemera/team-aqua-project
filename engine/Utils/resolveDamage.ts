import { CharacterInstance, ModEntry } from "../Instances/CharacterInstance";
import { applyCrit, rollCrit } from "./crit";

function applyAndTick(mods: ModEntry[], raw: number): { result: number; mods: ModEntry[] } {
    const result = mods.reduce((acc, { value }) => acc * value, raw);
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

export function resolvePhyDamage(raw: number, idUser: CharacterInstance, idTarget: CharacterInstance): number {
    const { result: afterUser,   mods: newPhyMod    } = applyAndTick(idUser.phyMod,       raw);
    const { result: afterTarget, mods: newPhyResMod } = applyResistance(afterUser, idTarget.phyRes, idTarget.phyResMod);

    idUser.phyMod      = newPhyMod;
    idTarget.phyResMod = newPhyResMod;

    const isCrit     = rollCrit(idUser);
    const finalDmg   = isCrit ? applyCrit(afterTarget, idUser) : afterTarget;

    return finalDmg;
}

export function resolveMagDamage(raw: number, idUser: CharacterInstance, idTarget: CharacterInstance): number {
    const { result: afterUser,   mods: newMagMod    } = applyAndTick(idUser.magMod,       raw);
    const { result: afterTarget, mods: newMagResMod } = applyResistance(afterUser, idTarget.magRes, idTarget.magResMod);

    idUser.magMod      = newMagMod;
    idTarget.magResMod = newMagResMod;

    const isCrit   = rollCrit(idUser);
    const finalDmg = isCrit ? applyCrit(afterTarget, idUser) : afterTarget;

    return finalDmg;
}
