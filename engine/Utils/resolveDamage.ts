import { CharacterInstance, ModEntry } from "../Instances/CharacterInstance";

function applyAndTick(mods: ModEntry[], raw: number): { result: number; mods: ModEntry[] } {
    const result = mods.reduce((acc, { value }) => acc * value, raw);
    return {
        result,
        mods: mods
            .map(entry => ({ ...entry, turn: entry.turn - 1 }))
            .filter(entry => entry.turn > 0),
    };
}

export function resolvePhyDamage(raw: number, idUser: CharacterInstance, idTarget: CharacterInstance): number {
    const { result: afterUser,   mods: newUserMod   } = applyAndTick(idUser.phyMod,   raw);
    const { result: afterTarget, mods: newTargetMod } = applyAndTick(idTarget.phyResMod, afterUser);

    idUser.phyMod    = newUserMod;
    idTarget.phyResMod  = newTargetMod;

    return afterTarget;
}

export function resolveMagDamage(raw: number, idUser: CharacterInstance, idTarget: CharacterInstance): number {
    const { result: afterUser,   mods: newUserMod   } = applyAndTick(idUser.magMod,    raw);
    const { result: afterTarget, mods: newTargetMod } = applyAndTick(idTarget.magResMod, afterUser);

    idUser.magMod    = newUserMod;
    idTarget.magResMod = newTargetMod;

    return afterTarget;
}
