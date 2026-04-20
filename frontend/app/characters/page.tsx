"use client";

import AppPageShell from "@/components/AppPageShell";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";

type Skill = {
	id: string;
	name: string;
	image: string;
	level: number;
	cost: number;
};

type SkillEffect = {
	title: string;
	description: string;
};

type SkillEffectSegment = {
	text: string;
	highlight?: boolean;
};

type ResolvedSkillEffect = {
	title: string;
	segments: SkillEffectSegment[];
};

type CharacterCard = {
	id: string;
	name: string;
	portrait: string;
	level: number;
	xpPercent: number;
	levelUpCost: number;
	skills: Skill[];
	stats: {
		physicalDamage: number;
		magicalDamage: number;
		critChance: number;
		critDamage: number;
		hp: number;
		mp: number;
		speed: number;
	};
};

const CHARACTERS: CharacterCard[] = [
	{
		id: "archer-1",
		name: "Archer",
		portrait: "/heroes/archer.png",
		level: 2,
		xpPercent: 90,
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
];

const RESOURCE_BOX_CLASS =
	"inline-flex w-fit items-center justify-end gap-2 whitespace-nowrap rounded-xl border border-[#3c3650] bg-[#242033] px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg sm:px-3 sm:py-2 sm:text-sm";

const PLAYER_RESOURCES = {
	ruby: 12,
	coin: 12_300,
} as const;

const MAX_CHARACTER_LEVEL = 10;
const MAX_SKILL_LEVEL = 10;
const LEVEL_UP_READY_CLASS = "!border-[#2f7f4f] !bg-[#1f5b37] !text-[#dcffe9] hover:!bg-[#286f44]";

const SKILL_EFFECTS: Record<string, SkillEffect> = {
	"Water Spell": {
		title: "Water Arrow",
		description:
			"Inflige {physical damage * skill level} degats a la cible (AoE), si le spell est utilise plusieurs fois d'affile, les degats augmentent de 60% a chaque fois",
	},
	"Frenzy Spell": {
		title: "Attack Boost",
		description: "Augmente les degats du prochain sort de {10% * skill level}",
	},
	Stunned: {
		title: "Stun",
		description:
			"Pendant le prochain tour de la cible, si il lance un sort il a {10% * skill level} de chances de le louper",
	},
};

const formatPercent = (value: number) => `${value.toFixed(0)}%`;

const resolveSkillEffect = (skill: Skill, stats: CharacterCard["stats"]): ResolvedSkillEffect | null => {
	const effect = SKILL_EFFECTS[skill.name];
	if (!effect) return null;

	if (skill.name === "Water Spell") {
		const damage = Math.round(stats.physicalDamage * skill.level);
		return {
			title: effect.title,
			segments: [
				{ text: "Inflige " },
				{ text: `${damage}`, highlight: true },
				{ text: " degats a la cible (AoE).\nSi le spell est utilise plusieurs fois d'affile, les degats augmentent de 60% a chaque fois." },
			],
		};
	}

	if (skill.name === "Frenzy Spell") {
		const bonusPercent = 10 * skill.level;
		return {
			title: effect.title,
			segments: [
				{ text: "Augmente les degats du prochain sort de " },
				{ text: `${formatPercent(bonusPercent)}`, highlight: true },
				{ text: "." },
			],
		};
	}

	if (skill.name === "Stunned") {
		const missChance = 10 * skill.level;
		return {
			title: effect.title,
			segments: [
				{ text: "Pendant le prochain tour de la cible, si il lance un sort il a " },
				{ text: `${formatPercent(missChance)}`, highlight: true },
				{ text: " de chances de le louper." },
			],
		};
	}

	return {
		title: effect.title,
		segments: [{ text: effect.description }],
	};
};

const formatCompactPower = (value: number) => {
	const units = ["", "k", "M", "B"];
	let scaledValue = value;
	let unitIndex = 0;

	while (scaledValue >= 1000 && unitIndex < units.length - 1) {
		scaledValue /= 1000;
		unitIndex += 1;
	}

	let formattedValue = Number(scaledValue.toFixed(1));

	if (formattedValue >= 1000 && unitIndex < units.length - 1) {
		formattedValue = Number((formattedValue / 1000).toFixed(1));
		unitIndex += 1;
	}

	return `${formattedValue}${units[unitIndex]}`;
};

const calculatePower = (stats: CharacterCard["stats"]) => {
	const base =
		(stats.physicalDamage + stats.magicalDamage) +
		(stats.critChance * stats.critDamage) +
		(stats.hp + stats.mp);

	return Math.round(base * (stats.speed / 100));
};

const STAT_GROUPS = [
	{
		id: "offense",
		title: "Offense",
		titleClassName: "border-[#6a2b2b] bg-[#311717] text-[#ffb3b3]",
		items: [
			{ key: "physicalDamage", label: "P.ATK", icon: "fa-hand-fist", iconColor: "text-[#ff8a7a]" },
			{ key: "magicalDamage", label: "M.ATK", icon: "fa-wand-magic-sparkles", iconColor: "text-[#7ecbff]" },
			{ key: "critChance", label: "Crit%", icon: "fa-crosshairs", iconColor: "text-[#f0d27a]" },
			{ key: "critDamage", label: "CritDMG", icon: "fa-star", iconColor: "text-[#ff9ecb]" },
		],
	},
	{
		id: "defense",
		title: "Defense",
		titleClassName: "border-[#2c5b36] bg-[#16301c] text-[#b9efc5]",
		items: [
			{ key: "hp", label: "HP", icon: "fa-heart", iconColor: "text-[#8fdf8f]" },
			{ key: "mp", label: "MP", icon: "fa-droplet", iconColor: "text-[#7fd9ff]" },
		],
	},
	{
		id: "mobility",
		title: "Mobility",
		titleClassName: "border-[#4a3a76] bg-[#21183b] text-[#d3c2ff]",
		items: [{ key: "speed", label: "Speed", icon: "fa-gauge-high", iconColor: "text-[#c0b3ff]" }],
	},
] as const;

const getLevelUpState = (currentLevel: number, maxLevel: number, cost: number, availableResource: number) => {
	const hasUpgradeAvailable = currentLevel < maxLevel;
	const hasEnoughResources = availableResource >= cost;
	const canLevelUp = hasUpgradeAvailable && hasEnoughResources;

	return { hasUpgradeAvailable, hasEnoughResources, canLevelUp };
};

const getSkillTooltipPositionClassName = (index: number) => {
	if (index === 0) return "left-0 -translate-x-0";
	if (index === 2) return "left-auto right-0 translate-x-0";
	return "left-1/2 -translate-x-1/2";
};

export default function CharactersPage() {
	return (
		<AppPageShell showSidebar containerClassName="min-h-0 flex-1">
			<section className="flex h-full w-full flex-col gap-3 overflow-y-auto rounded-2xl border border-[#3c3650] bg-[#15131d]/85 p-3 text-white shadow-2xl backdrop-blur-md sm:gap-4 sm:p-5">
				<header className="shrink-0 flex flex-wrap items-start justify-between gap-2 sm:gap-3">
					<div>
						<h1 className="text-2xl font-bold text-white sm:text-4xl">Characters</h1>
					</div>

					<div className="flex items-center gap-3">
						<div className={RESOURCE_BOX_CLASS}>
							<span>{PLAYER_RESOURCES.ruby}</span>
							<i className="fa-solid fa-gem text-pink-400" aria-hidden="true" />
						</div>
						<div className={RESOURCE_BOX_CLASS}>
							<span>{PLAYER_RESOURCES.coin.toLocaleString("fr-FR")}</span>
							<i className="fa-solid fa-coins text-amber-400" aria-hidden="true" />
						</div>
					</div>
				</header>

				<div className="min-h-0 flex-1 overflow-x-auto overflow-y-visible pb-1 sm:pb-2">
					<div className="flex w-max items-start gap-3 pr-2 sm:gap-4">
						{CHARACTERS.map((character) => {
							const xpWidth = `${Math.min(100, Math.max(0, character.xpPercent))}%`;
							const calculatedPower = calculatePower(character.stats);
							const isCharacterXpFull = character.xpPercent >= 100;
							const compactPower = formatCompactPower(calculatedPower);
							const characterLevelUp = getLevelUpState(character.level, MAX_CHARACTER_LEVEL, character.levelUpCost, PLAYER_RESOURCES.coin);

							return (
								<Card key={character.id} className="relative w-[min(92vw,390px)] shrink-0 overflow-visible border-[#4a4266] bg-[#171320] p-3 shadow-[0_14px_30px_rgba(0,0,0,0.35)] sm:p-4">
									<div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#2b2240]/65 to-transparent" />

									<div className="relative rounded-2xl border border-[#3c3650] bg-[#120f1a] p-3">
										<div className="flex items-start gap-3">
											<div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[4px] border-[#2e2743] bg-[#171320] shadow-[inset_0_0_24px_rgba(0,0,0,0.45)] sm:h-28 sm:w-28">
												<img src={character.portrait} alt={character.name} className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
											</div>

											<div className="min-w-0 flex-1">
												<div className="flex flex-wrap items-center justify-between gap-2">
													<h2 className="truncate text-3xl font-extrabold leading-none text-white sm:text-4xl">{character.name}</h2>
													<span className="rounded-full border border-[#99e0a6] bg-[#aef0b9] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#17331f] sm:text-sm">
														Lv. {character.level}
													</span>
												</div>

												<div className="mt-3 overflow-hidden rounded-2xl border border-[#5e4d25] bg-gradient-to-r from-[#2b2412] via-[#3a2f14] to-[#2a2411] px-3 py-2 shadow-[inset_0_0_0_1px_rgba(255,229,160,0.18)]">
													<div className="flex min-w-0 items-center gap-3">
														<div className="flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e8d18f] sm:text-xs">
															<i className="fa-solid fa-bolt text-[#ffd36f]" aria-hidden="true" />
														</div>
														<p
															className="min-w-0 flex-1 truncate text-right text-xl font-extrabold tracking-wide text-[#fff2cc] sm:text-2xl"
															title={calculatedPower.toLocaleString("fr-FR")}
														>
															{compactPower}
														</p>
													</div>
												</div>
											</div>
										</div>

										<div className="mt-3 flex items-center gap-2">
											<span className="shrink-0 text-base text-gray-400" title="Experience" aria-label="Experience">
												<i className="fa-solid fa-chart-line" aria-hidden="true" />
											</span>
											<div className="h-6 flex-1 overflow-hidden rounded-md border-[3px] border-[#110d18] bg-[#ececec]">
												<div className="h-full bg-gradient-to-r from-[#6bcf98] to-[#95e2b4]" style={{ width: xpWidth }} />
											</div>
											{isCharacterXpFull && (
												<Button
													type="button"
													size="sm"
													variant="ghost"
													className={`h-8 shrink-0 px-3 text-xs sm:h-9 sm:text-sm ${
														characterLevelUp.canLevelUp
															? LEVEL_UP_READY_CLASS
															: ""
													}`}
													disabled={!characterLevelUp.canLevelUp}
													title="Ameliorer le personnage"
													aria-label="Ameliorer le personnage"
												>
													<i className="fa-solid fa-arrow-up-right-dots" aria-hidden="true" />
												</Button>
											)}
										</div>
									</div>

									<div className="mt-4 grid grid-cols-3 gap-2.5">
										{character.skills.map((skill, skillIndex) => {
											const skillLevelUp = getLevelUpState(skill.level, MAX_SKILL_LEVEL, skill.cost, PLAYER_RESOURCES.ruby);
												const skillEffect = resolveSkillEffect(skill, character.stats);

											return (
												<div key={skill.id} className="relative z-0 text-center hover:z-50">
												<div className="group relative mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-[#4a4266] bg-transparent sm:h-16 sm:w-16">
													<span className="absolute -left-2 -top-2 rounded-full border border-[#4a4266] bg-[#171320] px-1.5 py-0.5 text-[10px] font-bold leading-none text-gray-100 shadow-md">
														Lv {skill.level}
													</span>
													<img src={skill.image} alt={skill.name} className="h-9 w-9 object-contain sm:h-11 sm:w-11" />
														{skillEffect && (
															<div className={`pointer-events-none absolute top-full z-[999] hidden w-[min(18rem,calc(100vw-1rem))] mt-3 rounded-xl border border-[#4b4264] bg-[#120f1a] px-3 py-2 text-left text-xs text-gray-100 shadow-2xl group-hover:block ${getSkillTooltipPositionClassName(skillIndex)}`}>
															<p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#e8d18f]">
																<img src={skill.image} alt={skill.name} className="h-5 w-5 shrink-0 object-contain" />
																{skillEffect.title}
															</p>
															<p className="mt-1 whitespace-pre-line break-words leading-snug text-gray-200">
																{skillEffect.segments.map((segment, segmentIndex) => (
																	<span
																		key={`${skill.id}-effect-${segmentIndex}`}
																		className={segment.highlight ? "font-extrabold text-[#a78bfa]" : undefined}
																	>
																		{segment.text}
																	</span>
																))}
															</p>
														</div>
													)}
												</div>
												<div className="group relative mt-2">
													<Button
														type="button"
														size="sm"
														variant="secondary"
														className={`h-8 w-full text-xs sm:text-sm ${
															skillLevelUp.canLevelUp
																? LEVEL_UP_READY_CLASS
																: ""
														}`}
														disabled={!skillLevelUp.canLevelUp}
														title={`Ameliorer ${skill.name}`}
														aria-label={`Ameliorer ${skill.name}`}
													>
														Level Up
													</Button>
												</div>
											</div>
											);
										})}
									</div>

									<div className="mt-3 rounded-xl border border-[#3c3650] bg-[#1b1727] p-3">
										<h3 className="text-xl font-bold text-white sm:text-2xl">Stats</h3>

										<div className="mt-3 space-y-2 text-sm text-gray-200 sm:text-base">
											{STAT_GROUPS.map((group) => (
												<div key={group.id} className="rounded-lg border border-[#3f3657] bg-[#13101d]/80 p-2">
													<div className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.11em] ${group.titleClassName}`}>
														{group.title}
													</div>
													<div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-2">
														{group.items.map((item) => (
															<div key={item.key} className="flex items-center justify-between rounded-md border border-[#3f3657] bg-[#13101d] px-2 py-1.5">
																<span className="flex items-center gap-1.5 whitespace-nowrap text-gray-300">
																	<i className={`fa-solid ${item.icon} ${item.iconColor}`} aria-hidden="true" />
																	{item.label}
																</span>
																<span className="font-bold text-white">{character.stats[item.key]}</span>
															</div>
														))}
													</div>
												</div>
											))}
										</div>
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			</section>
		</AppPageShell>
	);
}
