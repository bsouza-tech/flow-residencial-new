export const META_PIXEL_ID = '1297671708798854';

type FbqFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
};

type ConsentStatus = 'granted' | 'denied' | null;

type GenesisConsentApi = {
  get: () => ConsentStatus;
  grant: () => void;
  deny: () => void;
  reset: () => void;
  onChange: (callback: (status: ConsentStatus) => void) => () => void;
};

declare global {
  interface Window {
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
    GenesisConsent?: GenesisConsentApi;
  }
}

const firedEvents = new Set<string>();

function hasGrantedConsent() {
  if (typeof window === 'undefined') return false;
  try {
    return window.GenesisConsent?.get() === 'granted';
  } catch {
    return false;
  }
}

export function trackMeta(
  event: 'PageView' | 'ViewContent' | 'Lead' | 'CompleteRegistration',
  options?: { once?: boolean; params?: Record<string, unknown> }
) {
  if (!import.meta.env.PROD) return false;
  if (typeof window === 'undefined') return false;
  if (!hasGrantedConsent()) return false;
  if (typeof window.fbq !== 'function') return false;

  const once = options?.once ?? true;
  if (once && firedEvents.has(event)) return true;

  try {
    if (options?.params) {
      window.fbq('track', event, options.params);
    } else {
      window.fbq('track', event);
    }
  } catch {
    return false;
  }

  if (once) firedEvents.add(event);
  return true;
}
