import { cleanClickId, cleanTouch, isUuid, type Touch } from './trackingSanitize';

export type LeadTracking = {
  acesso_id: string | null;
  acesso_sessao_id: string;
  acesso_usuario_id: string;
  gclid: string | null;
  fbclid: string | null;
  first: Touch | null;
  last: Touch | null;
};

/**
 * Valida o que o navegador mandou (window.GenesisTracker.getContext()).
 * Sem usuario_id e sessao_id válidos o visitante não aceitou os cookies:
 * não gravamos nada de tracking no lead (o lead em si segue normal).
 */
export function parseLeadTracking(raw: unknown, now: Date = new Date()): LeadTracking | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (!isUuid(o.usuario_id) || !isUuid(o.sessao_id)) return null;
  return {
    acesso_id: isUuid(o.pageview_id) ? o.pageview_id : null,
    acesso_sessao_id: o.sessao_id,
    acesso_usuario_id: o.usuario_id,
    gclid: cleanClickId(o.gclid),
    fbclid: cleanClickId(o.fbclid),
    first: cleanTouch(o.first, now),
    last: cleanTouch(o.last, now),
  };
}

// Aceita a tag `sql` do @neondatabase/serverless (tagged template)
type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => PromiseLike<unknown>;

/**
 * Enriquece um lead JÁ SALVO com origem e ids da visita.
 * Chame dentro de try/catch: o lead nunca pode falhar por causa do tracking.
 * Retorna false quando não há nada a gravar.
 */
export async function saveLeadTracking(sql: SqlTag, leadId: string, raw: unknown): Promise<boolean> {
  const t = parseLeadTracking(raw);
  if (!t) return false;
  const f = t.first;
  const l = t.last;
  await sql`
    update leads set
      acesso_id = ${t.acesso_id},
      acesso_sessao_id = ${t.acesso_sessao_id},
      acesso_usuario_id = ${t.acesso_usuario_id},
      gclid = ${t.gclid},
      fbclid = ${t.fbclid},
      utm_first_source = ${f?.source ?? null},
      utm_first_medium = ${f?.medium ?? null},
      utm_first_campaign = ${f?.campaign ?? null},
      utm_first_content = ${f?.content ?? null},
      utm_first_term = ${f?.term ?? null},
      utm_first_referrer = ${f?.referrer ?? null},
      utm_first_landing_page = ${f?.landing_page ?? null},
      utm_first_at = ${f?.at ?? null},
      utm_last_source = ${l?.source ?? null},
      utm_last_medium = ${l?.medium ?? null},
      utm_last_campaign = ${l?.campaign ?? null},
      utm_last_content = ${l?.content ?? null},
      utm_last_term = ${l?.term ?? null},
      utm_last_referrer = ${l?.referrer ?? null},
      utm_last_landing_page = ${l?.landing_page ?? null},
      utm_last_at = ${l?.at ?? null}
    where id = ${leadId}
  `;
  return true;
}
