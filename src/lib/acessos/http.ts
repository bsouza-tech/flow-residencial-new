import type { APIContext } from 'astro';
import { checkRateLimit } from './rateLimit';

export function trackingContext(context: APIContext) {
  return {
    headers: context.request.headers,
    clientAddress: context.clientAddress,
  };
}

export async function parseJsonBody(
  request: Request,
): Promise<Record<string, unknown>> {
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    const parsed = JSON.parse(text) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* corpo inválido → {} */
  }
  return {};
}

export function noContent() {
  return new Response(null, { status: 204 });
}

export function tooManyRequests() {
  return new Response(null, { status: 429 });
}

export async function withTrackingGate(
  context: APIContext,
  fn: () => Promise<void>,
): Promise<Response> {
  if (checkRateLimit(context.request.headers, context.clientAddress)) {
    return tooManyRequests();
  }
  try {
    await fn();
  } catch (err) {
    console.error('[tracking] erro inesperado', err);
  }
  return noContent();
}
