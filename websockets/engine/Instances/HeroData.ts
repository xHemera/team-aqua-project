export interface HeroStats {
	physicalDamage:		number;
	magicalDamage:		number;
	critChance:			number;
	critDamage:			number;
	hp:					number;
	mp:					number;
	physicalResistance:	number;
	magicalResistance:	number;
	speed:				number;
}

export interface HeroSkillInfo {
	id:			string;
	level:		number;
	scaling:	number[][];
}

export interface HeroData {
	id:		string;
	name:	string;
	stats:	HeroStats;
	skills:	HeroSkillInfo[];
}