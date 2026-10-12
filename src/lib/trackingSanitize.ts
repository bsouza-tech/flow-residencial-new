// =====================================================================
// trackingSanitize.ts
// ESPELHO da seção "Sanitização" da Edge Function `track` (supabase). O
// servidor é quem normaliza UTM; aqui o lead usa exatamente as mesmas regras.
// NÃO edite à mão: se a regra mudar, mude na Edge Function e copie para cá.
// =====================================================================

export type Touch = {
  source: string
  medium: string
  medium_raw: string | null
  campaign: string | null
  term: string | null
  content: string | null
  referrer: string | null
  landing_page: string | null
  at: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SITE_KEY_RE = /^[a-z0-9]{8,64}$/i
const SECAO_RE = /^[a-z0-9_-]{1,40}$/
const CLICK_ID_RE = /^[A-Za-z0-9_.\-]{1,200}$/

export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v)

export function clean(v: unknown, max = 100): string | null {
  if (typeof v !== 'string') return null
  const s = v
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, max)
  return s || null
}

export function cleanPath(v: unknown, max = 200): string | null {
  if (typeof v !== 'string') return null
  let p = v.split('#')[0].split('?')[0].replace(/[\u0000-\u001f\u007f]/g, '').trim()
  if (!p) return null
  if (!p.startsWith('/')) p = '/' + p
  return p.slice(0, max)
}

// Referrer: só host + path (query string pode conter dado pessoal)
export function cleanUrl(v: unknown, max = 300): string | null {
  if (typeof v !== 'string' || !v) return null
  try {
    const u = new URL(v)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    const path = u.pathname === '/' ? '' : u.pathname
    return (u.hostname.toLowerCase() + path).slice(0, max)
  } catch {
    return null
  }
}

export function cleanClickId(v: unknown): string | null {
  return typeof v === 'string' && CLICK_ID_RE.test(v) ? v : null
}

export function cleanDate(v: unknown, now: Date): string {
  const d = new Date(typeof v === 'string' ? v : '')
  if (isNaN(d.getTime())) return now.toISOString()
  if (d > now) return now.toISOString()
  if (now.getTime() - d.getTime() > 800 * 86_400_000) return now.toISOString()
  return d.toISOString()
}

export function clampInt(v: unknown, min: number, max: number): number | null {
  if (typeof v !== 'number' || !isFinite(v)) return null
  return Math.min(max, Math.max(min, Math.round(v)))
}

const SOURCE_ALIASES: Record<string, string> = {
  fb: 'facebook', facebook: 'facebook',
  ig: 'instagram', instagram: 'instagram',
  google: 'google', googleads: 'google', adwords: 'google', 'google ads': 'google',
  wa: 'whatsapp', whatsapp: 'whatsapp',
  yt: 'youtube', youtube: 'youtube',
  tt: 'tiktok', tiktok: 'tiktok',
  x: 'twitter', twitter: 'twitter',
  lnkd: 'linkedin', linkedin: 'linkedin',
  bing: 'bing',
}

const MEDIUM_ALIASES: Record<string, string> = {
  ppc: 'cpc', paid: 'cpc', paidsearch: 'cpc', 'paid-search': 'cpc',
  paidsocial: 'paid_social', 'paid-social': 'paid_social', 'paid social': 'paid_social',
  'e-mail': 'email', mail: 'email',
  wpp: 'whatsapp', zap: 'whatsapp',
  qrcode: 'qr', 'qr-code': 'qr', 'qr code': 'qr',
  none: '(none)',
}
const MEDIUMS = new Set([
  'cpc', 'paid_social', 'social', 'email', 'whatsapp', 'qr',
  'organic', 'referral', 'direct', '(none)', '(not set)',
])

export function normMedium(raw: unknown): { value: string; raw: string | null } {
  const m = clean(raw, 60)
  if (!m) return { value: '(not set)', raw: null }
  const v = MEDIUM_ALIASES[m] ?? m
  if (MEDIUMS.has(v)) return { value: v, raw: null }
  return { value: 'outro', raw: m } // valor fora da lista: não perde a informação
}

export function cleanTouch(t: unknown, now: Date): Touch | null {
  if (!t || typeof t !== 'object') return null
  const o = t as Record<string, unknown>
  const src = clean(o.source, 100)
  if (!src) return null
  const m = normMedium(o.medium)
  return {
    source: SOURCE_ALIASES[src] ?? src,
    medium: m.value,
    medium_raw: m.raw,
    campaign: clean(o.campaign, 120),
    term: clean(o.term, 120),
    content: clean(o.content, 120),
    referrer: cleanUrl(o.referrer),
    landing_page: cleanPath(o.landing_page),
    at: cleanDate(o.at, now),
  }
}
