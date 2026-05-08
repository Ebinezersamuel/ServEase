module.exports = function createRateLimiter(options = {}) {
  const windowMs = Number(options.windowMs) || 60_000;
  const max = Number(options.max) || 120;
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = `${req.ip || req.socket.remoteAddress || "unknown"}:${req.baseUrl}`;
    const current = hits.get(key);

    if (!current || now > current.resetTime) {
      hits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      return res.status(429).json({ message: "Too many requests, please try again later." });
    }

    current.count += 1;
    hits.set(key, current);
    return next();
  };
};
