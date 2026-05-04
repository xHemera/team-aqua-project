export type ActionType = "basic" | "skill";

export type GameAction = {
	type:		ActionType;
	skillId?:	string;
	userUid:	string;
	targetUids:	string[];
}
