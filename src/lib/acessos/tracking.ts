import { config } from 'dotenv';
import {
  supabaseInsert,
  supabaseRpc,
  supabaseSelect,
  supabaseUpdateById,
} from './supabase';
import { classificarOrigem } from './classificarOrigem';

config();

export const ACESSOS_TABLE = 'acessos_user';

export type Consentimento = 'pendente' | 'aceito' | 'rejeitado';

export type RedeRow = {
  id: string;
  nome: string;
  ip: string;
  ativo: boolean;
  track_pagina: boolean;
  track_regiao: boolean;
  track_dispositivo: boolean;
  track_origem: boolean;
  track_tempo_permanencia: boolean;
  track_tempo_ativo: boolean;
  track_scroll: boolean;
  track_leitura: boolean;
};

export type RequestContext = {
  headers: Headers;
  clientAddress: string | undefined;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let redesCache: RedeRow[] = [];
let redesFetchedAt = 0;
const REDES_TTL_MS = 5 * 60 * 1000;

type MaxmindReader = {
  get: (ip: string) => {
    country?: { iso_code?: string };
    subdivisions?: Array<{ iso_code?: string }>;
    city?: { names?: { en?: string } };
  } | null;
};

let maxmindReader: MaxmindReader | null | undefined;

function readSiteId(): number | null {
  const raw = process.env.SITE_ID?.trim();
  if (!raw) {
    console.error('[tracking] SITE_ID ausente — não grava');
    return null;
  }
  const n = Number(raw);
  if (!Number.isInteger(n)) {
    console.error('[tracking] SITE_ID não é inteiro — não grava');
    return null;
  }
  return n;
}

export function normalizarIp(ip: string | null | undefined): string {
  if (!ip) return '';
  return ip.trim().replace(/^::ffff:/i, '');
}

/**
 * Se TRUST_PROXY !== 'true', usa clientAddress.
 * Senão: ÚLTIMA entrada de X-Forwarded-For → X-Real-IP → clientAddress.
 */
export function extrairIp(
  headers: Headers,
  clientAddress: string | undefined,
): string {
  const trust = process.env.TRUST_PROXY === 'true';
  if (!trust) return normalizarIp(clientAddress);

  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length) return normalizarIp(parts[parts.length - 1]);
  }
  const real = headers.get('x-real-ip');
  if (real) return normalizarIp(real);
  return normalizarIp(clientAddress);
}

export function classificarUserAgent(ua: string | null | undefined): {
  dispositivo: 'mobile' | 'desktop' | 'tablet' | 'unknown';
  bot: boolean;
} {
  if (!ua) return { dispositivo: 'unknown', bot: false };

  if (
    /bot|crawler|spider|crawling|headless|puppeteer|playwright|phantomjs|slurp|bingpreview|facebookexternalhit|whatsapp|telegram/i.test(
      ua,
    )
  ) {
    return { dispositivo: 'unknown', bot: true };
  }

  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) {
    return { dispositivo: 'tablet', bot: false };
  }

  if (/android|iphone|ipod|windows phone|iemobile|blackberry|opera mini/i.test(ua)) {
    return { dispositivo: 'mobile', bot: false };
  }

  return { dispositivo: 'desktop', bot: false };
}

function asTrackFlag(value: unknown): boolean {
  return value === true;
}

function normalizeRedeRow(row: RedeRow): RedeRow {
  return {
    ...row,
    ativo: asTrackFlag(row.ativo),
    track_pagina: asTrackFlag(row.track_pagina),
    track_regiao: asTrackFlag(row.track_regiao),
    track_dispositivo: asTrackFlag(row.track_dispositivo),
    track_origem: asTrackFlag(row.track_origem),
    track_tempo_permanencia: asTrackFlag(row.track_tempo_permanencia),
    track_tempo_ativo: asTrackFlag(row.track_tempo_ativo),
    track_scroll: asTrackFlag(row.track_scroll),
    track_leitura: asTrackFlag(row.track_leitura),
  };
}

export async function casarRede(ip: string): Promise<RedeRow | null> {
  const normalized = normalizarIp(ip);
  if (!normalized) return null;

  const now = Date.now();
  if (!redesCache.length || now - redesFetchedAt > REDES_TTL_MS) {
    try {
      const rows = await supabaseSelect<RedeRow>(
        'acessos_redes',
        'select=*&ativo=eq.true',
      );
      redesCache = rows.map(normalizeRedeRow);
      redesFetchedAt = now;
    } catch (err) {
      console.error('[tracking] falha ao carregar acessos_redes', err);
    }
  }

  return redesCache.find((r) => normalizarIp(r.ip) === normalized) ?? null;
}

export async function obterIpERede(
  ctx: RequestContext,
): Promise<{ ip: string; rede: RedeRow | null }> {
  const ip = extrairIp(ctx.headers, ctx.clientAddress);
  const rede = await casarRede(ip);
  return { ip, rede };
}

async function lookupGeo(ip: string): Promise<{
  geo_pais: string | null;
  geo_uf: string | null;
  geo_cidade: string | null;
}> {
  const empty = { geo_pais: null, geo_uf: null, geo_cidade: null };
  const dbPath = process.env.MAXMIND_DB_PATH?.trim();
  if (!dbPath || !ip) return empty;

  try {
    if (maxmindReader === undefined) {
      const maxmind = await import('maxmind');
      maxmindReader = (await maxmind.open(dbPath)) as MaxmindReader;
    }
    if (!maxmindReader) return empty;
    const r = maxmindReader.get(ip);
    if (!r) return empty;
    return {
      geo_pais: r.country?.iso_code ?? null,
      geo_uf: r.subdivisions?.[0]?.iso_code ?? null,
      geo_cidade: r.city?.names?.en ?? null,
    };
  } catch (err) {
    console.warn('[tracking] geo MaxMind falhou', err);
    maxmindReader = null;
    return empty;
  }
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

function clampStr(value: unknown, max: number): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.slice(0, max);
}

function parseOcorridoEm(raw: unknown): string {
  const now = new Date();
  if (typeof raw !== 'string' || !raw.trim()) return now.toISOString();
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    console.warn('[tracking] ocorrido_em inválido — usando now()');
    return now.toISOString();
  }
  const diff = Math.abs(now.getTime() - d.getTime());
  if (diff > 24 * 60 * 60 * 1000) {
    console.warn('[tracking] ocorrido_em fora de 1 dia — usando now()');
    return now.toISOString();
  }
  return d.toISOString();
}

function clampInt(value: unknown, min: number, max: number): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function sanitizeSecoes(raw: unknown): Record<string, number> | undefined {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;
  const entries = Object.entries(raw as Record<string, unknown>);
  if (entries.length > 30) return undefined;
  const out: Record<string, number> = {};
  for (const [key, val] of entries) {
    if (typeof key !== 'string' || key.length === 0 || key.length > 50) {
      return undefined;
    }
    const n = Number(val);
    if (!Number.isInteger(n) || n < 0 || n > 86400) return undefined;
    out[key] = n;
  }
  return out;
}

export type EntradaPayload = {
  id?: unknown;
  caminho?: unknown;
  titulo?: unknown;
  ocorrido_em?: unknown;
  consentimento?: unknown;
  sessao_id?: unknown;
  click_id?: unknown;
  click_id_tipo?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  utm_term?: unknown;
  referrer_host?: unknown;
  referrer_caminho?: unknown;
};

export async function registrarEntrada(
  payload: EntradaPayload,
  ctx: RequestContext,
): Promise<void> {
  const siteId = readSiteId();
  if (siteId == null) return;

  if (!isUuid(payload.id)) {
    console.warn('[tracking] entrada: id inválido');
    return;
  }

  const caminho = clampStr(payload.caminho, 500);
  if (!caminho) {
    console.warn('[tracking] entrada: caminho inválido');
    return;
  }

  const titulo = clampStr(payload.titulo, 200);
  const ocorrido_em = parseOcorridoEm(payload.ocorrido_em);

  const consentRaw = String(payload.consentimento ?? '').trim();
  if (
    consentRaw !== 'pendente' &&
    consentRaw !== 'aceito' &&
    consentRaw !== 'rejeitado'
  ) {
    console.warn('[tracking] entrada: consentimento inválido');
    return;
  }
  const consentimento = consentRaw as Consentimento;

  const utm_source = clampStr(payload.utm_source, 200);
  const utm_medium = clampStr(payload.utm_medium, 200);
  const utm_campaign = clampStr(payload.utm_campaign, 200);
  const utm_content = clampStr(payload.utm_content, 200);
  const utm_term = clampStr(payload.utm_term, 200);
  const referrer_host = clampStr(payload.referrer_host, 255);
  const referrer_caminho = clampStr(payload.referrer_caminho, 300);
  const click_id = clampStr(payload.click_id, 200);
  const click_id_tipo = clampStr(payload.click_id_tipo, 50);

  const { ip, rede } = await obterIpERede(ctx);

  if (rede && !rede.track_pagina) {
    console.warn(
      `[tracking] rede ${rede.nome} (${ip}) com track_pagina=false — não grava`,
    );
    return;
  }

  const ua = ctx.headers.get('user-agent') ?? '';
  const { dispositivo, bot } = classificarUserAgent(ua);

  if (bot) {
    try {
      await supabaseRpc('registrar_bot', { p_site_id: siteId });
    } catch (err) {
      console.error('[tracking] registrar_bot falhou', err);
    }
    return;
  }

  const consentiu = consentimento === 'aceito';
  const trackDisp = !rede || rede.track_dispositivo;
  const trackGeo = !rede || rede.track_regiao;
  const trackOrigem = !rede || rede.track_origem;

  const origem = trackOrigem
    ? classificarOrigem({
        utm_source,
        utm_medium,
        click_id_tipo,
        referrer_host,
      })
    : null;

  const geo = trackGeo
    ? await lookupGeo(ip)
    : { geo_pais: null, geo_uf: null, geo_cidade: null };

  const row: Record<string, unknown> = {
    site_id: siteId,
    id: payload.id,
    caminho,
    titulo,
    ocorrido_em,
    consentimento,
    colaborador: Boolean(rede),
    rede_id: rede?.id ?? null,
    dispositivo: trackDisp ? dispositivo : null,
    geo_pais: trackGeo ? geo.geo_pais : null,
    geo_uf: trackGeo ? geo.geo_uf : null,
    geo_cidade: trackGeo ? geo.geo_cidade : null,
    referrer_host: trackOrigem ? referrer_host : null,
    referrer_caminho: trackOrigem ? referrer_caminho : null,
    origem: trackOrigem ? origem : null,
    utm_source: trackOrigem ? utm_source : null,
    utm_medium: trackOrigem ? utm_medium : null,
    utm_campaign: trackOrigem ? utm_campaign : null,
    utm_content: trackOrigem ? utm_content : null,
    utm_term: trackOrigem ? utm_term : null,
    ip: null,
    user_agent: null,
    sessao_id: null,
    click_id: null,
    click_id_tipo: null,
    clicou_whatsapp: false,
  };

  if (consentiu && !rede) {
    row.ip = ip || null;
    row.user_agent = ua ? ua.slice(0, 500) : null;
    row.sessao_id = isUuid(payload.sessao_id) ? payload.sessao_id : null;
    row.click_id = click_id;
    row.click_id_tipo = click_id_tipo;
  }

  try {
    await supabaseInsert(ACESSOS_TABLE, row);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[tracking] insert acessos_user falhou', msg);
  }
}

export type SaidaPayload = {
  id?: unknown;
  permanencia_s?: unknown;
  ativo_s?: unknown;
  scroll_pct?: unknown;
  leu_conteudo?: unknown;
  clicou_whatsapp?: unknown;
  secoes?: unknown;
};

export function montarPatchSaida(
  payload: SaidaPayload,
  rede: RedeRow | null,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  const permanencia = clampInt(payload.permanencia_s, 0, 86400);
  const ativo = clampInt(payload.ativo_s, 0, 86400);
  const scroll = clampInt(payload.scroll_pct, 0, 100);
  const secoes = sanitizeSecoes(payload.secoes);

  const trackPermanencia = !rede || rede.track_tempo_permanencia === true;
  const trackAtivo = !rede || rede.track_tempo_ativo === true;
  const trackScroll = !rede || rede.track_scroll === true;
  const trackLeitura = !rede || rede.track_leitura === true;

  if (trackPermanencia && permanencia !== undefined) {
    patch.permanencia_s = permanencia;
  }
  if (trackAtivo) {
    if (ativo !== undefined) patch.ativo_s = ativo;
    if (secoes !== undefined) patch.secoes = secoes;
  }
  if (trackScroll && scroll !== undefined) {
    patch.scroll_pct = scroll;
  }
  if (trackLeitura && typeof payload.leu_conteudo === 'boolean') {
    patch.leu_conteudo = payload.leu_conteudo;
  }

  if (typeof payload.clicou_whatsapp === 'boolean') {
    patch.clicou_whatsapp = payload.clicou_whatsapp;
  }

  return patch;
}

export async function registrarSaida(
  payload: SaidaPayload,
  ctx: RequestContext,
): Promise<void> {
  if (!isUuid(payload.id)) {
    console.warn('[tracking] saida: id inválido');
    return;
  }

  const siteId = readSiteId();
  if (siteId == null) return;

  const { rede } = await obterIpERede(ctx);
  const patch = montarPatchSaida(payload, rede);

  if (Object.keys(patch).length === 0) return;

  try {
    await supabaseUpdateById(ACESSOS_TABLE, payload.id, patch);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[tracking] update saida falhou', msg);
  }
}

export type ConsentimentoPayload = {
  id?: unknown;
  sessao_id?: unknown;
};

export async function registrarAceiteConsentimento(
  payload: ConsentimentoPayload,
  ctx: RequestContext,
): Promise<void> {
  if (!isUuid(payload.id)) {
    console.warn('[tracking] consentimento: id inválido');
    return;
  }

  const siteId = readSiteId();
  if (siteId == null) return;

  const { ip, rede } = await obterIpERede(ctx);
  const ua = ctx.headers.get('user-agent') ?? '';

  const patch: Record<string, unknown> = {
    consentimento: 'aceito',
  };

  if (!rede) {
    if (isUuid(payload.sessao_id)) patch.sessao_id = payload.sessao_id;
    patch.ip = ip || null;
    patch.user_agent = ua ? ua.slice(0, 500) : null;
  }

  try {
    await supabaseUpdateById(
      ACESSOS_TABLE,
      payload.id,
      patch,
      'consentimento=eq.pendente',
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[tracking] aceite consentimento falhou', msg);
  }
}
