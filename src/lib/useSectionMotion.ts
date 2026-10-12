import { useEffect, type DependencyList, type RefObject } from 'react';
import { gsap, ScrollTrigger } from './gsap';

/** Espera fontes e monta um gsap.context — animações ficam sincronas dentro do setup. */
export function useSectionMotion(
  sectionRef: RefObject<HTMLElement | null>,
  setup: () => void,
  deps: DependencyList = []
) {
  useEffect(() => {
    document.documentElement.setAttribute('data-reveal-ready', '');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      sectionRef.current?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        el.setAttribute('data-revealed', '');
      });
      return;
    }

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    const start = () => {
      if (cancelled || !sectionRef.current) return;
      ctx = gsap.context(setup, sectionRef);
      ScrollTrigger.refresh();
    };

    const fonts = document.fonts;
    if (fonts?.status === 'loaded') {
      start();
    } else if (fonts?.ready) {
      fonts.ready.then(start).catch(start);
    } else {
      start();
    }

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, deps);
}
