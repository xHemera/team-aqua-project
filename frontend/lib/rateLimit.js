// lib/rateLimit.js

export async function rateLimit(redis, key, limit = 5, windowSec = 10) {
    const current = await redis.incr(key);

    if (current === 1)
        await redis.expire(key, windowSec);

    if (current > limit)
        return false;

    return true;
}