import { CharacterData } from "@/components/organisms/characters/types";
import { socket } from "@/socket";

export type Team = {
    owner: string;
    characters: string[];
    levels: number[];
    skillsLevels: number[];
}

export async function initialData(team1: Team, team2: Team)
{
    socket.emit("initiate", {
        team1: team1,
        team2: team2,
    });
}

export async function piercingShot(target: string)
{
    if (target)
    {
        socket.emit("piercingShot", target);
    }
}

export async function rainOfArrows()
{
    socket.emit("rainOfArrows");
}

export async function precisionFocus(target: string)
{
    if (target)
    {
        socket.emit("precisionFocus", target);
    }
}

export async function shadowStrike(target: string)
{
    if (target)
    {
        socket.emit("shadowStrike", target);
    }
}

export async function venomBlade(target: string)
{
    if (target)
    {
        socket.emit("venomBlade", target);
    }
}

export async function phantomStep(target: string)
{
    if (target)
    {
        socket.emit("phantomStep", target);
    }
}

export async function healingLight(target: string)
{
    if (target)
    {
        socket.emit("healingLight", target);
    }
}

export async function sanctuary()
{
    socket.emit("sanctuary");
}

export async function divineProtection(target: string)
{
    if (target)
    {
        socket.emit("divineProtection", target);
    }
}

export async function shieldBash(target: string)
{
    if (target)
    {
        socket.emit("shieldBash", target);
    }
}

export async function ironWill()
{
    socket.emit("ironWill");
}

export async function lastStand(target: string)
{
    if (target)
    {
        socket.emit("lastStand", target);
    }
}

export async function fireball(target: string)
{
    if (target)
    {
        socket.emit("fireball", target);
    }
}

export async function arcaneMissiles()
{
    socket.emit("arcaneMissiles");
}

export async function meteor()
{
    socket.emit("meteor");
}