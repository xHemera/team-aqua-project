import { socket } from "@/socket";

export type Team = {
    owner: string;
    characters: string[];
    levels: number[];
    skillsLevels: number[];
}

export type ActionType = "basic" | "skill" | "skip";

export type GameAction = {
    type: ActionType;
    skillId?: string;
    userUid: string;
    targetUids: string[];
}

function initialData(team: Team, roomId: number)
{
    socket.emit("initiate", {
        team: team,
        roomId: roomId,
    });
}

function submitAction(action: GameAction)
{
    socket.emit("gameAction", action);
}

function forfeit()
{
    socket.emit("forfeit");
}

export const spells = { initialData, submitAction, forfeit };
