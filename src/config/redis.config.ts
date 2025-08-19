import { createClient } from 'redis';
import { config } from './env';

const redisClient = createClient({
  url: config.redis.REDIS_URL
});

redisClient.on("error", (err) => console.error("Redis Error:", err));

(async () => {
  await redisClient.connect();
  console.log("✅ Redis connected successfully!");
})();

export default redisClient;

