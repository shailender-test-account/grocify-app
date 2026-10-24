import { Redis } from 'ioredis';

const redislient = new Redis(process.env.REDIS_URI ||  "redis://localhost:6380",{
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redislient.on('connect', () => console.log('Redis Cache Engine Connected'));
redislient.on('error', (err) => console.error('Redis Connection Error:', err));

export default redislient;