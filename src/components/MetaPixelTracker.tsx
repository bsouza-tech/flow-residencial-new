import { useEffect } from 'react';
import { trackMeta } from '../lib/metaPixel';

/** Dispara ViewContent uma vez quando o usuário chega perto do fim da página. */
export default function MetaPixelTracker() {
  useEffect(() => {
    const markViewContent = () => trackMeta('ViewContent');

    const footer = document.querySelector('footer');
    let observer: IntersectionObserver | null = null;

    if (footer && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            markViewContent();
            observer?.disconnect();
          }
        },
        { root: null, threshold: 0.2 }
      );
      observer.observe(footer);
    }

    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewport = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      if (scrollTop + viewport >= fullHeight - 120) {
        markViewContent();
        window.removeEventListener('scroll', onScroll);
        observer?.disconnect();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer?.disconnect();
    };
  }, []);

  return null;
}
