import { PiercingShot, PrecisionFocus, RainOfArrows } from "./archer-spells";
import { PhantomStep, ShadowStrike, VenomBlade } from "./assassin-spells";
import { Spell } from "./Spell";

type SpellFactory = () => Spell;

const SPELL_REGISTRY: Record<string, SpellFactory> = {
	"archer_s1": () => new PiercingShot(),
	"archer_s2": () => new RainOfArrows(),
	"archer_s3": () => new PrecisionFocus(),
    "assassin_s1": () => new ShadowStrike(),
    "assassin_s2": () => new VenomBlade(),
    "assassin_s3": () => new PhantomStep(),
};

export function buildSpellMap(characterId: string, skills: { id: string }[]): Map<string, Spell> {
	const map = new Map<string, Spell>();
	skills.forEach(skill => {
		const key 		= '${characterId}_${skill.id}';
		const factory	= SPELL_REGISTRY[key];
		if (factory) map.set(skill.id, factory());
	});
	return map;
}