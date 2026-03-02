class PokemonCard extends Card {
    private health:     number;
    private stage:      number;
    private element:    string;
	private status:		string;
	private special:	string;
	/** Special == EX, Mega EX etc, pour interaction Mega Signal etc */
	private rulebox:	boolean;
	private prize:		number;
	/** WIP TALENT AND ATTACKS 
	 *  Sera remplace par une classe specifique*/
    private slot1:     	string;
	private slot2:     	string;

	private weakness:	string;
	private resist:		string;
	private retreat:	number;

	/** Constructeurs */
	constructor() {
		super();
		this.health = 0;
		this.stage = 0;
		this.element = "DefaultElement";
		this.status = "None";
		this.special = "Default";
		this.rulebox = false;
		this.prize	= 1;
		this.slot1= "DefaultAttack";
		this.slot2 = "DefaultAttack";
		this.weakness = "None";
		this.resist = "None";
		this.retreat = 0;
	}

	/** Getters */
	getHealth(): number {
		return this.health;
	}
	getStage(): number {
		return this.stage;
	}
	getElement(): string {
		return this.element;
	}
	getStatus(): string { 
		return this.status;
	}
	getSpecial(): string {
		return this.special;
	}
	isRulebox(): boolean {
		return this.rulebox;
	}
	getPrize(): number {
		return this.prize;
	}
	getSlot1(): string {
		return this.slot1;
	}
	getSlot2(): string {
		return this.slot2;
	}
	getWeakness(): string {
		return this.weakness;
	}
	getResist(): string {
		return this.resist;
	}
	getRetreat(): number {
		return this.retreat;
	}
}