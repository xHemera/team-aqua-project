import { archer } from "../../frontend/public/gameResources/heroes/archer/hero";
import { assassin } from "../../frontend/public/gameResources/heroes/assassin/hero";
import { PiercingShot, PrecisionFocus, RainOfArrows } from "./archer-spells";
import { PhantomStep, ShadowStrike, VenomBlade } from "./assassin-spells";
import { Spell } from "./Spell";

type SpellFactory = () => Spell;

const SPELL_REGISTRY: Record<string, SpellFactory> = {
	"archer_s1": () => new PiercingShot(archer.skills[0].scaling),
	"archer_s2": () => new RainOfArrows(archer.skills[1].scaling),
	"archer_s3": () => new PrecisionFocus(archer.skills[2].scaling),
    "assassin_s1": () => new ShadowStrike(assassin.skills[0].scaling),
    "assassin_s2": () => new VenomBlade(assassin.skills[1].scaling),
    "assassin_s3": () => new PhantomStep(assassin.skills[2].scaling),
};

export function buildSpellMap(characterId: string, skills: { id: string }[]): Map<string, Spell> {
	const map = new Map<string, Spell>();
	skills.forEach(skill => {
		const key 		= `${characterId}_${skill.id}`;
		const factory	= SPELL_REGISTRY[key];
		if (factory) map.set(skill.id, factory());
	});
	return map;
}