export type ActionType = "basic" | "skill";

export type GameAction = {
	type:		ActionType;
	skillUid?:	string;
	userUid:	string;
	targetUids:	string[];
}