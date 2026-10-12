import { gsap } from './gsap';

type RevealBase = {
  trigger?: Element | null;
  start?: string;
  delay?: number;
  duration?: number;
};

type ItemsOptions = RevealBase & {
  stagger?: number;
  y?: number;
  scale?: number;
};

function motionEnabled() {
  return document.documentElement.classList.contains('js');
}

function finish(targets: Element[]) {
  targets.forEach((el) => el.setAttribute('data-revealed', ''));
  gsap.set(targets, { clearProps: 'opacity,transform,clipPath' });
}

function skipRevealed(items: Element[]) {
  return items.filter((el) => !el.hasAttribute('data-revealed'));
}

/** Cards / itens em cascata no scroll (opacity + y + scale sutil). */
export function revealItems(
  elements: ArrayLike<Element> | NodeListOf<Element> | null | undefined,
  options: ItemsOptions = {}
) {
  const items = skipRevealed(elements ? gsap.utils.toArray<Element>(elements) : []);
  if (!items.length || !motionEnabled()) return;

  const {
    trigger = items[0]?.parentElement ?? items[0],
    start = 'top 84%',
    stagger = 0.1,
    y = 48,
    scale = 0.96,
    duration = 0.8,
    delay = 0,
  } = options;

  gsap.fromTo(
    items,
    { opacity: 0, y, scale, transformOrigin: '50% 90%' },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration,
      stagger,
      delay,
      ease: 'power3.out',
      onComplete: () => finish(items),
      scrollTrigger: {
        trigger: trigger ?? items[0],
        start,
        once: true,
      },
    }
  );
}

/** Bloco único subindo no scroll. */
export function revealBlock(
  element: Element | null | undefined,
  options: RevealBase & { y?: number; scale?: number } = {}
) {
  if (!element || element.hasAttribute('data-revealed') || !motionEnabled()) return;

  const {
    trigger = element,
    start = 'top 86%',
    y = 40,
    scale = 0.98,
    duration = 0.85,
    delay = 0,
  } = options;

  gsap.fromTo(
    element,
    { opacity: 0, y, scale },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration,
      delay,
      ease: 'power3.out',
      onComplete: () => finish([element]),
      scrollTrigger: { trigger, start, once: true },
    }
  );
}

/** Mídia com clip + leve zoom-out (sensação de “carregando”). */
export function revealMedia(
  element: Element | null | undefined,
  options: RevealBase & { radius?: number } = {}
) {
  if (!element || element.hasAttribute('data-revealed') || !motionEnabled()) return;

  const {
    trigger = element,
    start = 'top 82%',
    duration = 1.05,
    delay = 0,
    radius = 12,
  } = options;

  gsap.fromTo(
    element,
    {
      opacity: 0,
      scale: 1.06,
      clipPath: `inset(10% 8% 10% 8% round ${radius}px)`,
    },
    {
      opacity: 1,
      scale: 1,
      clipPath: `inset(0% 0% 0% 0% round ${radius}px)`,
      duration,
      delay,
      ease: 'power3.out',
      onComplete: () => finish([element]),
      scrollTrigger: { trigger, start, once: true },
    }
  );
}

/** Colunas / painéis em sequência (mapa + lista, visual + info). */
export function revealColumns(
  elements: ArrayLike<Element> | NodeListOf<Element> | null | undefined,
  options: ItemsOptions = {}
) {
  const items = skipRevealed(elements ? gsap.utils.toArray<Element>(elements) : []);
  if (!items.length || !motionEnabled()) return;

  const {
    trigger = items[0]?.parentElement ?? items[0],
    start = 'top 82%',
    stagger = 0.16,
    duration = 0.9,
    delay = 0,
  } = options;

  items.forEach((el, i) => {
    const fromX = i % 2 === 0 ? -36 : 36;
    gsap.fromTo(
      el,
      { opacity: 0, x: fromX, y: 24 },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay: delay + i * stagger,
        ease: 'power3.out',
        onComplete: () => finish([el]),
        scrollTrigger: {
          trigger: trigger ?? el,
          start,
          once: true,
        },
      }
    );
  });
}
