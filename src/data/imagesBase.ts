/** Prefixo CDN/WordPress para arquivos de /img/. Vazio = servir local. */
let imagesBaseUrl = '';

export function setImagesBaseUrl(url: string) {
  imagesBaseUrl = url;
}

export function getImagesBaseUrl() {
  return imagesBaseUrl;
}

/**
 * Normaliza `images.baseUrl` do content.json.
 * `""` = local. Não-vazio exige https e barra final. Retorna `null` se inválido.
 */
export function normalizeImagesBaseUrl(value: unknown): string | null {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed === '') return '';
  if (!/^https:\/\//i.test(trimmed)) return null;
  if (!trimmed.endsWith('/')) return null;
  return trimmed;
}

/** Converte `/img/arquivo` → baseUrl+arquivo (ou mantém local). */
export function resolveImgPath(localPath: string): string {
  if (!imagesBaseUrl) return localPath;
  if (localPath.startsWith('/img/')) {
    return `${imagesBaseUrl}${localPath.slice('/img/'.length)}`;
  }
  return localPath;
}

/** Origem para `<link rel="preconnect">`, ou null se local. */
export function imagesPreconnectOrigin(): string | null {
  if (!imagesBaseUrl) return null;
  try {
    return new URL(imagesBaseUrl).origin;
  } catch {
    return null;
  }
}
