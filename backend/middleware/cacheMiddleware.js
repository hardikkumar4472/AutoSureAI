import { get, set } from "../config/redis.js";

export const cache = (keyPrefix, duration = 3600) => {
  return async (req, res, next) => {
    // Create a unique key based on the request URL
    // e.g., traffic_reports_/api/traffic/reports?page=1
    const key = `${keyPrefix}_${req.originalUrl || req.url}`;

    try {
      const cachedData = await get(key);

      if (cachedData) {
        console.log(`⚡ Cache Hit: ${key}`);
        res.set("X-Cache", "HIT");
        return res.json(cachedData);
      }

      console.log(`🐢 Cache Miss: ${key}`);
      res.set("X-Cache", "MISS");

      // Override res.json to intercept the response
      const originalJson = res.json;

      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode === 200) {
            set(key, body, duration).catch(err => console.error("Cache Save Error:", err));
        }
        res.json = originalJson;
        return res.json(body);
      };

      next();
    } catch (err) {
      console.error("Cache Middleware Error:", err);
      next(); // Proceed without caching on error
    }
  };
};
