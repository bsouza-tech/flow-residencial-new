import type { APIRoute } from 'astro';
import { parseJsonBody, trackingContext, withTrackingGate } from '../../../lib/acessos/http';
import { registrarEntrada } from '../../../lib/acessos/tracking';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const body = await parseJsonBody(context.request);
  return withTrackingGate(context, () =>
    registrarEntrada(body, trackingContext(context)),
  );
};
