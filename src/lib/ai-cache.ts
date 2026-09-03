/**
 * Tiny in-memory TTL cache for AI results, so repeat page views don't re-hit the
 * local model. Per server process; clears on redeploy. Good enough for a
 * single-node deployment — swap for Redis / unstable_cache if you scale out.
 */

type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();
const DEFAULT_TTL_MS = 10 * 60 * 1000;

export async function withCache<T>(
  key: string,
  ttlMs: number,
  producer: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;

  const value = await producer();
  store.set(key, { value, expires: now + (ttlMs || DEFAULT_TTL_MS) });

  // opportunistic cleanup
  if (store.size > 500) {
    for (const [k, v] of store) if (v.expires <= now) store.delete(k);
  }
  return value;
}

/** Stable short fingerprint for cache keys. */
export function fingerprint(input: unknown): string {
  const str = typeof input === "string" ? input : JSON.stringify(input);
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}
