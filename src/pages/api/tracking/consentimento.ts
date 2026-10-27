import type { APIRoute } from 'astro';
import { parseJsonBody, trackingContext, withTrackingGate } from '../../../lib/acessos/http';
import { registrarAceiteConsentimento } from '../../../lib/acessos/tracking';

export const prerender = false;

export const PATCH: APIRoute = async (context) => {
  const body = await parseJsonBody(context.request);
  return withTrackingGate(context, () =>
    registrarAceiteConsentimento(body, trackingContext(context)),
  );
};
