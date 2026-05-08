import { createClient } from 'redis';
import { io } from "./server.js"

export const redis = createClient({
    url: "redis://aqua-redis:6379"
});

redis.on('error', (err) => console.log('Redis Client Error', err));

if (!redis.isOpen)
    await redis.connect();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

while (true)
{
    try {
        const waitingQueue = await redis.lLen("players_queue");
        if (waitingQueue >= 2)
        {
            const p1 = await redis.lpop("players_queue");
            const p2 = await redis.lpop("players_queue");

            const receiverSockP1 = await redis.hGet("online_users", p1);
            const receiverSockP2 = await redis.hGet("online_users", p2);
            if (receiverSockP1 && receiverSockP2)
            {
                io.to(receiverSockP1).emit("matchFound");
                io.to(receiverSockP2).emit("matchFound");
            }
        }
        await sleep(1000);
    }
    catch (err) {
        console.log(error);
        await sleep(1000);
    }
}