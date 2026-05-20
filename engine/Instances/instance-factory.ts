import { archer } from "../../frontend/public/gameResources/heroes/archer/hero";
import { assassin } from "../../frontend/public/gameResources/heroes/assassin/hero";
import { healer } from "../../frontend/public/gameResources/heroes/healer/hero";
import { knight } from "../../frontend/public/gameResources/heroes/knight/hero";
import { mage } from "../../frontend/public/gameResources/heroes/mage/hero";
import { HeroData } from "./HeroData";

function toHeroData(hero: typeof archer): HeroData {
	return {
		id:		hero.identity.id,
		name:	hero.identity.name,
		stats:	hero.baseStats,
		skills:	hero.skills.map(s => ({
			id:			s.id,
			level:		1,
			scaling:	s.scaling,
		})),
	};
}

const HERO_REGISTRY: Record<string, HeroData> = {
	archer:		toHeroData(archer),
	assassin:	toHeroData(assassin),
	healer:		toHeroData(healer),
	knight:		toHeroData(knight),
	mage:		toHeroData(mage),
};

export function getHeroData(characterId: string): HeroData {
	const data = HERO_REGISTRY[characterId];
	if (!data) throw new Error(`WHO IS THIS: ${characterId}`);
	return data;
}