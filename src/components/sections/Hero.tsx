import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

const TITLE_ARIA = 'Um lugar para viver bem todos os dias.';

/** Fade + deslize por letra. Stagger original 0.022; encurtado para 0.008 (2,75×) para o último caractere terminar cedo e o LCP do parágrafo não escorregar. */
const CHAR_BASE_DELAY_S = 0.05;
const CHAR_STAGGER_S = 0.008;

function CharSpans({
  text,
  startIndex,
}: {
  text: string;
  startIndex: number;
}): { nodes: ReactNode[]; nextIndex: number } {
  const nodes: ReactNode[] = [];
  let index = startIndex;
  // Agrupa por palavra (nowrap) para não quebrar "viver" no meio — equivalente ao wordsClass do SplitText.
  const parts = text.split(/(\s+)/);

  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      for (const ch of part) {
        const style = { '--i': index } as CSSProperties;
        nodes.push(
          <span key={index} className="hero__char" aria-hidden="true" style={style}>
            {'\u00A0'}
          </span>
        );
        index += 1;
      }
      continue;
    }

    const chars = part.split('').map((ch) => {
      const i = index;
      index += 1;
      const style = { '--i': i } as CSSProperties;
      return (
        <span key={i} className="hero__char" aria-hidden="true" style={style}>
          {ch}
        </span>
      );
    });

    nodes.push(
      <span key={`w-${startIndex}-${part}-${index}`} className="hero__word" aria-hidden="true">
        {chars}
      </span>
    );
  }

  return { nodes, nextIndex: index };
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    (async () => {
      const gsapMod = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;

      const gsap = gsapMod.default;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        const media = sectionRef.current?.querySelector('.hero__media');

        if (media) {
          gsap.fromTo(
            media,
            { scale: 1.16 },
            { scale: 1.02, duration: 2.4, ease: 'power2.out' }
          );
          gsap.to(media, {
            yPercent: 14,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }
      }, sectionRef);
    })().catch(() => {
      /* parallax opcional — falha silenciosa */
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  let charIndex = 0;
  const line1Before = CharSpans({ text: 'Um lugar para ', startIndex: charIndex });
  charIndex = line1Before.nextIndex;
  const line1Em = CharSpans({ text: 'viver bem', startIndex: charIndex });
  charIndex = line1Em.nextIndex;
  const line2 = CharSpans({ text: 'todos os dias.', startIndex: charIndex });

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Apresentação do Solar Bellavista"
      className="hero"
    >
      <div className="hero__media" aria-hidden="true" />

      <div className="hero__overlay" aria-hidden="true" />

      <div className="container hero__content">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            Solar Bellavista
            <span aria-hidden="true">·</span>
            Teresópolis
          </p>

          <h1 className="hero__title" aria-label={TITLE_ARIA}>
            <span className="hero__line" aria-hidden="true">
              {line1Before.nodes}
              <em>{line1Em.nodes}</em>
            </span>
            <span className="hero__line" aria-hidden="true">
              {line2.nodes}
            </span>
          </h1>

          <p className="hero__text">
            Conforto, lazer e praticidade para transformar o seu jeito de morar em Teresópolis.
          </p>

          <div className="hero__actions">
            <a href="#interesse" className="hero__btn hero__btn--primary" data-abrir-formulario="">
              Quero conhecer
            </a>
            <a href="#plantas" className="hero__btn hero__btn--secondary">
              Ver plantas
            </a>
          </div>
        </div>
      </div>

      <a href="#beneficios" className="hero__scroll" aria-label="Explorar — ir para a próxima seção">
        <span>Explorar</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>

      <style>{`
        .hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          color: #ffffff;
        }

        .hero__media {
          position: absolute;
          inset: 0;
          background-color: #013034;
          background-image: url('/img/fachada-1200.webp');
          background-image: -webkit-image-set(
            url('/img/fachada-1200.avif') type('image/avif'),
            url('/img/fachada-1200.webp') type('image/webp')
          );
          background-image: image-set(
            url('/img/fachada-1200.avif') type('image/avif'),
            url('/img/fachada-1200.webp') type('image/webp')
          );
          background-size: cover;
          background-position: center 28%;
          transform: scale(1.02);
        }

        @media (min-width: 1280px) {
          .hero__media {
            background-image: url('/img/fachada-1680.webp');
            background-image: -webkit-image-set(
              url('/img/fachada-1680.avif') type('image/avif'),
              url('/img/fachada-1680.webp') type('image/webp')
            );
            background-image: image-set(
              url('/img/fachada-1680.avif') type('image/avif'),
              url('/img/fachada-1680.webp') type('image/webp')
            );
          }
        }


        .hero__overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              105deg,
              rgba(1, 48, 52, 0.72) 0%,
              rgba(1, 48, 52, 0.35) 48%,
              rgba(1, 48, 52, 0.12) 100%
            ),
            linear-gradient(
              to top,
              rgba(1, 48, 52, 0.92) 0%,
              rgba(1, 48, 52, 0.55) 42%,
              rgba(1, 48, 52, 0.08) 100%
            );
        }

        .hero__content {
          position: relative;
          z-index: 1;
          width: min(calc(100% - clamp(2.75rem, 8vw, 6rem)), 1280px);
          padding-top: 7.5rem;
          padding-bottom: clamp(4.5rem, 9vh, 7rem);
        }

        .hero__copy {
          max-width: min(100%, 42rem);
        }

        .hero__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          margin: 0 0 1.35rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #ffd166;
          animation: heroRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
        }

        .hero__eyebrow span {
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0;
        }

        .hero__title {
          margin: 0;
          max-width: none;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: clamp(2.45rem, 5.6vw, 4.6rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #ffffff;
        }

        .hero__line {
          display: block;
          overflow: hidden;
          padding-bottom: 0.12em;
          margin-bottom: -0.12em;
        }

        .hero__word {
          display: inline-block;
          white-space: nowrap;
        }

        .hero__char {
          display: inline-block;
          animation: heroCharIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(${CHAR_BASE_DELAY_S}s + (var(--i) * ${CHAR_STAGGER_S}s));
        }

        .hero__title em {
          font-style: normal;
          font-weight: 800;
          color: #eb9c36;
        }

        .hero__text {
          margin: 1.6rem 0 0;
          max-width: 42ch;
          font-family: 'Open Sans Variable', 'Open Sans Fallback', 'Open Sans', Arial, sans-serif;
          font-size: clamp(1rem, 1.4vw, 1.125rem);
          font-weight: 400;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.86);
          /* Parágrafo visível no 1º paint: o LCP é este texto. Sem opacity:0. */
        }

        .hero__actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          margin-top: 2.15rem;
          animation: heroCtaIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both;
        }

        .hero__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0.85rem 1.55rem;
          border-radius: 999px;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, color 0.2s ease;
        }

        .hero__btn--primary {
          background: #eb9c36;
          color: #013034;
          box-shadow: 0 10px 24px rgba(235, 156, 54, 0.28);
        }

        .hero__btn--primary:hover {
          background: #d88928;
          transform: translateY(-1px);
          color: #013034;
        }

        .hero__btn--secondary {
          background: transparent;
          color: #ffffff;
          border: 1.5px solid rgba(255, 255, 255, 0.55);
        }

        .hero__btn--secondary:hover {
          border-color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .hero__scroll {
          position: absolute;
          right: clamp(1.25rem, 4vw, 2.5rem);
          bottom: 2rem;
          z-index: 1;
          display: none;
          flex-direction: column;
          align-items: center;
          gap: 0.55rem;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.55);
          animation: heroRise 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.7s both;
        }

        .hero__scroll span:first-child {
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          writing-mode: vertical-rl;
        }

        .hero__scroll-line {
          width: 1px;
          height: 2.4rem;
          background: rgba(255, 255, 255, 0.22);
          position: relative;
          overflow: hidden;
        }

        .hero__scroll-line::after {
          content: '';
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: 45%;
          background: #eb9c36;
          animation: heroScroll 1.6s ease-in-out infinite;
        }

        @keyframes heroRise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes heroCtaIn {
          from { opacity: 0; transform: translateY(22px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes heroCharIn {
          from { opacity: 0; transform: translateY(120%) rotate(5deg); }
          to { opacity: 1; transform: translateY(0) rotate(0deg); }
        }

        @keyframes heroScroll {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(280%); }
        }

        @media (min-width: 768px) {
          .hero__scroll {
            display: flex;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero__eyebrow,
          .hero__char,
          .hero__text,
          .hero__actions,
          .hero__scroll {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .hero__scroll-line::after {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
