"use client";

import AppPageShell from "@/components/AppPageShell";
import ResourceChip from "@/components/atoms/characters/ResourceChip";
import CharacterCard from "@/components/organisms/characters/CharacterCard";
import type { CharacterData, PlayerResources } from "@/components/organisms/characters/types";

const CHARACTERS: CharacterData[] = [
	{
		id: "archer-1",
		name: "Archer",
		portrait: "/heroes/archer.png",
		level: 2,
		xpPercent: 100,
		levelUpCost: 550,
		skills: [
			{ id: "s1", name: "Water Spell", image: "/spells/water_spell.png", level: 2, cost: 10 },
			{ id: "s2", name: "Frenzy Spell", image: "/spells/frenzy_spell_(critical_booster).png", level: 2, cost: 10 },
			{ id: "s3", name: "Stunned", image: "/spells/stunned.png", level: 2, cost: 10 },
		],
		stats: {
			physicalDamage: 123,
			magicalDamage: 123,
			critChance: 123,
			critDamage: 123,
			hp: 123,
			mp: 123,
			speed: 123,
		},
	},
	{
		id: "assassin-1",
		name: "Assassin",
		portrait: "/heroes/assassin.png",
		level: 4,
		xpPercent: 76,
		levelUpCost: 780,
		skills: [
			{ id: "s1", name: "Silence", image: "/spells/silenced.png", level: 2, cost: 10 },
			{ id: "s2", name: "Poison Dart", image: "/spells/poison_dagger.png", level: 3, cost: 12 },
			{ id: "s3", name: "Amplify", image: "/spells/frenzy_spell_(critical_booster).png", level: 1, cost: 9 },
		],
		stats: {
			physicalDamage: 154,
			magicalDamage: 88,
			critChance: 34,
			critDamage: 181,
			hp: 109,
			mp: 78,
			speed: 145,
		},
	},
	{
		id: "healer-1",
		name: "Healer",
		portrait: "/heroes/healer.png",
		level: 3,
		xpPercent: 58,
		levelUpCost: 640,
		skills: [
			{ id: "s1", name: "Healing", image: "/spells/healing_spell.png", level: 2, cost: 8 },
			{ id: "s2", name: "Defense Boost", image: "/spells/defense_boost.png", level: 1, cost: 7 },
			{ id: "s3", name: "Divine Protection", image: "/spells/divine_protection_spell.png", level: 2, cost: 9 },
		],
		stats: {
			physicalDamage: 82,
			magicalDamage: 149,
			critChance: 19,
			critDamage: 132,
			hp: 164,
			mp: 176,
			speed: 111,
		},
	},
	{
		id: "knight-1",
		name: "Knight",
		portrait: "/heroes/knight.png",
		level: 5,
		xpPercent: 92,
		levelUpCost: 980,
		skills: [
			{ id: "s1", name: "Fortify", image: "/spells/fortify_spell.png", level: 3, cost: 11 },
			{ id: "s2", name: "Damage Boost", image: "/spells/attack_boost.png", level: 2, cost: 10 },
			{ id: "s3", name: "Berserk", image: "/spells/on_fire_(burning).png", level: 3, cost: 13 },
		],
		stats: {
			physicalDamage: 177,
			magicalDamage: 71,
			critChance: 14,
			critDamage: 121,
			hp: 223,
			mp: 97,
			speed: 89,
		},
	},
	{
		id: "mage-1",
		name: "Mage",
		portrait: "/heroes/mage.png",
		level: 4,
		xpPercent: 100,
		levelUpCost: 860,
		skills: [
			{ id: "s1", name: "Fireball", image: "/spells/fire_spell.png", level: 1, cost: 9 },
			{ id: "s2", name: "Mana Restoration", image: "/spells/mana_replenish.png", level: 3, cost: 11 },
			{ id: "s3", name: "Counterspell", image: "/spells/counterspell.png", level: 5, cost: 14 },
		],
		stats: {
			physicalDamage: 61,
			magicalDamage: 212,
			critChance: 26,
			critDamage: 148,
			hp: 104,
			mp: 241,
			speed: 122,
		},
	},
];

const PLAYER_RESOURCES: PlayerResources = {
	ruby: 12,
	coin: 12_300,
};

const MAX_CHARACTER_LEVEL = 10;
const MAX_SKILL_LEVEL = 10;

export default function CharactersPage() {
	return (
		<AppPageShell showSidebar containerClassName="min-h-0 flex-1">
			<section className="flex h-full w-full min-w-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-[#3c3650] bg-[#15131d]/85 p-3 text-white shadow-2xl backdrop-blur-md sm:gap-4 sm:p-5">
				<header className="shrink-0 flex flex-wrap items-start justify-between gap-2 sm:gap-3">
					<div>
						<h1 className="text-2xl font-bold text-white sm:text-4xl">Characters</h1>
					</div>

					<div className="flex items-center gap-3">
						<ResourceChip value={`${PLAYER_RESOURCES.ruby}`} iconClassName="fa-solid fa-gem text-pink-400" />
						<ResourceChip value={PLAYER_RESOURCES.coin.toLocaleString("fr-FR")} iconClassName="fa-solid fa-coins text-amber-400" />
					</div>
				</header>

				<div className="min-h-0 min-w-0 w-full flex-1 overflow-x-auto overflow-y-visible pb-1 sm:pb-2">
					<div className="flex min-w-max items-start gap-3 pr-6 sm:gap-4">
						{CHARACTERS.map((character) => (
							<CharacterCard
								key={character.id}
								character={character}
								resources={PLAYER_RESOURCES}
								maxCharacterLevel={MAX_CHARACTER_LEVEL}
								maxSkillLevel={MAX_SKILL_LEVEL}
							/>
						))}
					</div>
				</div>
			</section>
		</AppPageShell>
	);
}
