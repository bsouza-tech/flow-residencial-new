import { useEffect } from 'react';
import { trackMeta } from '../lib/metaPixel';

/** Dispara ViewContent uma vez quando o rodapé entra na tela. */
export default function MetaPixelTracker() {
  useEffect(() => {
    const footer = document.querySelector('footer');
    let observer: IntersectionObserver | null = null;
    let stopConsent: (() => void) | undefined;
    let done = false;

    const footerInView = () => {
      if (!footer) return false;
      const rect = footer.getBoundingClientRect();
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      return visible >= Math.min(rect.height, window.innerHeight) * 0.2;
    };

    const nearEnd = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const fullHeight = document.documentElement.scrollHeight;
      return scrollTop + window.innerHeight >= fullHeight - 120;
    };

    const tryFire = () => {
      if (done) return;
      if (!footerInView() && !nearEnd()) return;
      if (!trackMeta('ViewContent')) return;
      done = true;
      observer?.disconnect();
      window.removeEventListener('scroll', onScroll);
      stopConsent?.();
    };

    const onScroll = () => tryFire();

    if (footer && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) tryFire();
        },
        { root: null, threshold: 0.2 }
      );
      observer.observe(footer);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    tryFire();
    stopConsent = window.GenesisConsent?.onChange(() => tryFire());

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
      stopConsent?.();
    };
  }, []);

  return null;
}
