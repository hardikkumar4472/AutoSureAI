import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();
const DISCONNECT_REDIS = true;

const redis = DISCONNECT_REDIS
  ? {
      on: () => {},
      get: async () => null,
      set: async () => {},
      del: async () => {},
      scanStream: () => ({ on: () => {} }),
      pipeline: () => ({ del: () => {}, exec: () => {} }),
      status: 'mock'
    }
  : process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

if (DISCONNECT_REDIS) {
    console.log("⚠️ Redis Disconnected (Temporary Mock Active)");
}
redis.on("connect", () => {
  console.log("Redis Connected!");
});
redis.on("error", (err) => {
  console.error("Redis Error:", err);
});
export const get = async (key) => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};
export const set = async (key, value, duration = 3600) => {
  await redis.set(key, JSON.stringify(value), "EX", duration);
};
export const del = async (key) => {
  await redis.del(key);
};
export const clearPattern = async (pattern) => {
  const stream = redis.scanStream({
    match: pattern,
  });

  stream.on("data", (keys) => {
    if (keys.length) {
      const pipeline = redis.pipeline();
      keys.forEach((key) => {
        pipeline.del(key);
      });
      pipeline.exec();
    }
  });

  stream.on("end", () => {
    console.log(`Cleared cache for pattern: ${pattern}`);
  });
};

export default redis;
