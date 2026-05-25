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

async function initialData(team: Team, roomId: number)
{
    socket.emit("initiate", {
        team: team,
        roomId: roomId,
    });
}

async function submitAction(action: GameAction)
{
    socket.emit("gameAction", action);
}

export const spells = { initialData, submitAction };
