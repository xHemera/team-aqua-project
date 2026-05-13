import { createClient } from 'redis';
import { io } from "./server.js"

export const redis = createClient({
    url: "redis://aqua-redis:6379"
});

redis.on('error', (err) => console.log('Redis Client Error', err));

if (!redis.isOpen)
    await redis.connect();

redis.on("error", (err) => console.log("Redis error", err));

async function matchmaking()
{
    while (true)
    {
        try {
            const p1 = await redis.brPop("players_queue", 0);
            const p2 = await redis.brPop("players_queue", 0);

            const player1 = JSON.parse(p1.element);
            const player2 = JSON.parse(p2.element);

            if (player1 && player2)
            {
                io.to(player1).emit("matchFound");
                io.to(player2).emit("matchFound");
            }
        }
        catch (err) {
            console.log(err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

matchmaking();
