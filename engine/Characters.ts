import { Spell } from "./Spells"

export class Character {
	id:				string
	name:			string
	level:			number
	power:			number
	phys_atk:		number
	mag_atk:		number
	critc:			number
	critd:			number
	hp:				number
	mp:				number
	speed:			number
	spells:			Spell[] = []

	constructor() {
		this.id 		= "default_id"
		this.name 		= "default_name"
		this.level 		= 0
		this.power		= 0
		this.phys_atk	= 0
		this.mag_atk 	= 0
		this.critc		= 0
		this.critd		= 0
		this.hp 		= 0
		this.mp			= 0
		this.speed 		= 0
	}
}
