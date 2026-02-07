import { redisConnection } from "../queue/queue";

const buildHourKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hour = String(date.getUTCHours()).padStart(2, "0");
  return `${year}${month}${day}${hour}`;
};

const secondsUntilNextHour = (date: Date) => {
  const next = new Date(date);
  next.setUTCMinutes(60, 0, 0);
  return Math.max(1, Math.floor((next.getTime() - date.getTime()) / 1000));
};

export const checkHourlyLimit = async (senderEmail: string, limit: number) => {
  const now = new Date();
  const hourKey = buildHourKey(now);
  const key = `email_count:${hourKey}:${senderEmail}`;
  const ttlSeconds = secondsUntilNextHour(now);

  const script = `
    local key = KEYS[1]
    local limit = tonumber(ARGV[1])
    local ttl = tonumber(ARGV[2])
    local current = tonumber(redis.call('get', key) or '0')
    if current >= limit then
      return {0, current}
    end
    current = redis.call('incr', key)
    if current == 1 then
      redis.call('expire', key, ttl)
    end
    return {1, current}
  `;

  const result = (await redisConnection.eval(script, 1, key, limit, ttlSeconds)) as [number, number];
  const allowed = result[0] === 1;

  if (allowed) {
    return { allowed: true, retryAt: null as number | null };
  }

  const nextHour = new Date(now);
  nextHour.setUTCMinutes(60, 0, 0);
  return { allowed: false, retryAt: nextHour.getTime() };
};
