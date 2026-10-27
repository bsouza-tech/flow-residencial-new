const PAGO = new Set([
  'cpc',
  'ppc',
  'paid',
  'paid_social',
  'paidsocial',
  'ads',
  'ad',
  'cpm',
]);

const FONTES_META = new Set([
  'facebook',
  'instagram',
  'meta',
  'fb',
  'ig',
  'msg',
  'an',
]);

const FONTES_GOOGLE = new Set(['google', 'adwords']);

const BUSCADORES = [
  'google.',
  'bing.',
  'yahoo.',
  'duckduckgo.',
  'ecosia.',
];

const SOCIAIS = [
  'facebook.',
  'instagram.',
  'linkedin.',
  'tiktok.',
  'youtube.',
  't.co',
  'x.com',
  'twitter.',
  'pinterest.',
  'whatsapp.',
];

export type OrigemClassificada =
  | 'anuncio-google'
  | 'anuncio-meta'
  | 'social'
  | 'campanha'
  | 'busca-organica'
  | 'referencia'
  | 'direto'
  | 'desconhecido';

export type ClassificarOrigemInput = {
  utm_source?: string | null;
  utm_medium?: string | null;
  click_id_tipo?: string | null;
  referrer_host?: string | null;
  /** Host do próprio site. Sem ele, referrer do mesmo domínio não é detectado. */
  own_host?: string | null;
};

function norm(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function hostMatches(host: string, needles: string[]): boolean {
  const h = host.toLowerCase();
  return needles.some((n) => h === n.replace(/\.$/, '') || h.includes(n));
}

export function classificarOrigem(input: ClassificarOrigemInput): OrigemClassificada {
  const source = norm(input.utm_source);
  const medium = norm(input.utm_medium);
  const clickTipo = norm(input.click_id_tipo);
  const refHost = norm(input.referrer_host);
  const own = norm(input.own_host);
  const pago = medium !== '' && PAGO.has(medium);

  if (clickTipo === 'gclid' || clickTipo === 'gbraid' || clickTipo === 'wbraid') {
    return 'anuncio-google';
  }

  if (source && FONTES_GOOGLE.has(source) && pago) {
    return 'anuncio-google';
  }

  if (source && FONTES_META.has(source) && pago) {
    return 'anuncio-meta';
  }

  if ((source && FONTES_META.has(source)) || (clickTipo === 'fbclid' && !pago)) {
    return 'social';
  }

  if (source) {
    return 'campanha';
  }

  if (refHost) {
    const sameSite =
      own &&
      (refHost === own || refHost.endsWith(`.${own}`) || own.endsWith(`.${refHost}`));
    if (sameSite) return 'direto';

    if (hostMatches(refHost, BUSCADORES)) return 'busca-organica';
    if (hostMatches(refHost, SOCIAIS)) return 'social';
    return 'referencia';
  }

  return 'direto';
}
