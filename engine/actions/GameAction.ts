export type GameAction = 
	| { type: "DRAW_CARD", player: number}
	| { 
		type: "PLAY_POKEMON"
		player: number
		cardUid: string
	  }
	| {
		type: "ATTACK"
		player: number
		attackIndex: number
	  }
	| { type: "END_TURN", player: number}
	| { 
		type: "PLAY_ACTIVE"
		player: number
		cardUid: string
	  }
	| { 
		type: "RETREAT_POKEMON"
		player: number
		cardUid: string
	  }