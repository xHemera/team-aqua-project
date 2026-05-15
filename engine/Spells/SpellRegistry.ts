import { PiercingShot, PrecisionFocus, RainOfArrows } from "./archer-spells";
import { PhantomStep, ShadowStrike, VenomBlade } from "./assassin-spells";
import { Spell } from "./Spell";

type SpellFactory = () => Spell;

const SPELL_REGISTRY: Record<string, SpellFactory> = {
	"archer-1_s1": () => new PiercingShot(),
	"archer-1_s2": () => new RainOfArrows(),
	"archer-1_s3": () => new PrecisionFocus(),
    "assassin-1_s1": () => new ShadowStrike(),
    "assassin-1_s2": () => new VenomBlade(),
    "assassin-1_s3": () => new PhantomStep(),
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