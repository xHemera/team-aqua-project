class PokemonCard extends Card {
    health:     		number;
    stage:      		number;
    element:    		string;
	status:				string;
	special:			string;
	/** Special == EX, Mega EX etc, pour interaction Mega Signal etc */
	rulebox:			boolean;
	prize:				number;
	/** WIP TALENT AND ATTACKS */
    abilty:     		string;
	attack1:     		string;
	attack2:     		string;
	weakness:			string;
	resist:				string;
	retreat:			number;

	constructor() {
		super();
		this.health = 0;
		this.stage = 0;
		this.element = "DefaultElement";
		this.status = "None";
		this.special = "Default";
		this.rulebox = false;
		this.prize	= 1;
		this.abilty = "None";
		this.attack1 = "DefaultAttack";
		this.attack2 = "DefaultAttack";
		this.weakness = "None";
		this.resist = "None";
		this.retreat = 0;
	}
}