const buckets = new Map();

const prune = (key, windowMs) => {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry) return;
  entry.hits = entry.hits.filter((t) => now - t < windowMs);
  if (entry.hits.length === 0) buckets.delete(key);
};

const createRateLimiter =
  ({ windowMs = 15 * 60 * 1000, max = 10, message = 'Too many requests. Please try again later.' }) =>
  (req, res, next) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const routeKey = `${ip}:${req.baseUrl}${req.path}`;
    prune(routeKey, windowMs);
    const entry = buckets.get(routeKey) || { hits: [] };
    entry.hits.push(Date.now());
    buckets.set(routeKey, entry);

    if (entry.hits.length > max) {
      return res.status(429).json({ success: false, message });
    }
    next();
  };

module.exports = { createRateLimiter };
