import { extrairIp } from './tracking';

/** 40 req/min por IP (chave = extrairIp). */
const RATE_LIMIT = 40;
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const key = ip || 'unknown';
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now >= entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export function checkRateLimit(
  headers: Headers,
  clientAddress: string | undefined,
): boolean {
  const ip = extrairIp(headers, clientAddress);
  return rateLimited(ip);
}
