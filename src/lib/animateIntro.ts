import { gsap, ScrollTrigger, SplitText } from './gsap';

type IntroOptions = {
  trigger?: Element | null;
  eyebrow?: string;
  heading?: string;
  text?: string;
  extras?: string;
};

function motionEnabled() {
  return document.documentElement.classList.contains('js');
}

function finish(targets: Element[]) {
  if (!targets.length) return;
  targets.forEach((el) => el.setAttribute('data-revealed', ''));
  gsap.set(targets, { clearProps: 'opacity,transform,clipPath' });
}

/** Anima a partir do estado já escondido pelo CSS (`html.js [data-reveal]`). */
export function animateSectionIntro(
  intro: Element | null | undefined,
  options: IntroOptions = {}
) {
  if (!intro || !motionEnabled()) return;

  const pending = (el: HTMLElement | null) => (el && !el.hasAttribute('data-revealed') ? el : null);
  const eyebrow = pending(intro.querySelector<HTMLElement>(options.eyebrow ?? '.eyebrow, .cta__badge'));
  const heading = pending(intro.querySelector<HTMLElement>(options.heading ?? 'h1, h2'));
  const text = pending(intro.querySelector<HTMLElement>(options.text ?? ':scope > p, .cta__text'));
  const extras = options.extras
    ? Array.from(intro.querySelectorAll<HTMLElement>(options.extras)).filter(
        (el) => !el.hasAttribute('data-revealed')
      )
    : [];
  if (!eyebrow && !heading && !text && !extras.length) return;
  const trigger = options.trigger ?? intro;
  const done: Element[] = [];

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger,
      start: 'top 88%',
      once: true,
    },
    onComplete: () => finish(done),
  });

  if (eyebrow) {
    done.push(eyebrow);
    tl.fromTo(
      eyebrow,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      0
    );
  }

  if (heading) {
    const split = SplitText.create(heading, {
      type: 'chars,words,lines',
      charsClass: 'split-char',
      wordsClass: 'split-word',
      linesClass: 'split-line',
      aria: 'auto',
    });

    gsap.set(split.chars, { opacity: 0, yPercent: 130, rotate: 5 });
    heading.setAttribute('data-revealed', '');

    tl.to(
      split.chars,
      {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        duration: 0.8,
        stagger: 0.02,
        ease: 'power3.out',
        onComplete: () => {
          gsap.set(split.chars, { clearProps: 'opacity,transform,rotate' });
        },
      },
      eyebrow ? '-=0.2' : 0
    );
  }

  if (text) {
    done.push(text);
    tl.fromTo(
      text,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
      '-=0.4'
    );
  }

  if (extras.length) {
    done.push(...extras);
    tl.fromTo(
      extras,
      { opacity: 0, y: 20, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power3.out',
      },
      '-=0.3'
    );
  }

  ScrollTrigger.refresh();
}
