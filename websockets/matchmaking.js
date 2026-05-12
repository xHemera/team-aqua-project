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

            const receiverSockP1 = await redis.hGet("online_users", player1);
            const receiverSockP2 = await redis.hGet("online_users", player2);
            if (receiverSockP1 && receiverSockP2)
            {
                io.to(receiverSockP1).emit("matchFound");
                io.to(receiverSockP2).emit("matchFound");
            }
        }
        catch (err) {
            console.log(err);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

matchmaking();
