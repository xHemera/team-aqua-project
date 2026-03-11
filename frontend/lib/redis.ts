import 'server-only'
import { createClient } from 'redis';

export const redis = createClient({
    url: 'redis://redis:6379',
});

redis.on('error', (err) => console.log('Redis Client Error', err));

await redis.connect();