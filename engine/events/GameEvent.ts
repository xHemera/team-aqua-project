export type GameEvent =

	| { type: "POKEMON_KO", pokemonUid: string }
	| { type: "TURN_START", player: number}
	| { type: "TURN_END", player: number}