export class Spell {
	id:			string
	name:		string
	effect:		number
	mpCost:		number
	level:		number

	constructor() {
		this.id = "default_id"
		this.name = "default_name"
		this.effect = 0
		this.mpCost = 0
		this.level = 0
	}
}