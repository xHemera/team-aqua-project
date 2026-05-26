export type ActionType = "basic" | "skill" | "skip";

export type GameAction = {
	type:		ActionType;
	skillId?:	string;
	userUid:	string;
	targetUids:	string[];
}
