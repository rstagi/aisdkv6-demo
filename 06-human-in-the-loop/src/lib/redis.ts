import Redis from "ioredis";

export const redis = new Redis({
  host: "localhost",
  port: 6379,
});

const MEMORY_PREFIX = "memory:";

export async function remember(key: string, value: string): Promise<void> {
  await redis.set(`${MEMORY_PREFIX}${key}`, value);
}

export async function recall(key: string): Promise<string | null> {
  return redis.get(`${MEMORY_PREFIX}${key}`);
}

export async function listMemories(): Promise<{ key: string; value: string }[]> {
  const keys = await redis.keys(`${MEMORY_PREFIX}*`);
  if (keys.length === 0) return [];

  const values = await redis.mget(keys);
  return keys.map((k, i) => ({
    key: k.replace(MEMORY_PREFIX, ""),
    value: values[i] || "",
  }));
}
