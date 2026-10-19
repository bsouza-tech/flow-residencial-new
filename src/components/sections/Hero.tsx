import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

const TITLE_ARIA = 'Morar com praticidade nunca foi tão fácil';

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
  const line1Before = CharSpans({ text: 'Morar com ', startIndex: charIndex });
  charIndex = line1Before.nextIndex;
  const line1Em = CharSpans({ text: 'praticidade', startIndex: charIndex });
  charIndex = line1Em.nextIndex;
  const line2 = CharSpans({ text: 'nunca foi tão fácil', startIndex: charIndex });

  return (
    <section
      ref={sectionRef}
      id="hero"
      aria-label="Apresentação do Flow Residencial"
      className="hero"
    >
      <div className="hero__media" aria-hidden="true" />

      <div className="hero__overlay" aria-hidden="true" />

      <div className="container hero__content">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            Flow Residencial
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
            Um empreendimento moderno, funcional e perfeito para quem busca viver com estilo e praticidade em Teresópolis.
          </p>

          <div className="hero__actions">
            <a href="#interesse" className="hero__btn hero__btn--primary" data-abrir-formulario="">
              Receber condições
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
          color: var(--cor-texto);
        }

        .hero__media {
          position: absolute;
          inset: 0;
          background-color: var(--cor-fundo-profundo);
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
              color-mix(in srgb, var(--cor-fundo-profundo) 56%, transparent) 0%,
              color-mix(in srgb, var(--cor-fundo-profundo) 22%, transparent) 48%,
              color-mix(in srgb, var(--cor-fundo-profundo) 6%, transparent) 100%
            ),
            linear-gradient(
              to top,
              color-mix(in srgb, var(--cor-fundo-profundo) 78%, transparent) 0%,
              color-mix(in srgb, var(--cor-fundo-profundo) 38%, transparent) 42%,
              color-mix(in srgb, var(--cor-fundo-profundo) 4%, transparent) 100%
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
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: heroRise 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both, 11s infinite flow-shift-x;
        }

        .hero__eyebrow span {
          background: none;
          -webkit-background-clip: border-box;
          background-clip: border-box;
          -webkit-text-fill-color: color-mix(in srgb, var(--cor-texto) 45%, transparent);
          color: color-mix(in srgb, var(--cor-texto) 45%, transparent);
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
          color: var(--cor-texto);
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
          animation: 11s infinite flow-shift-x-var;
        }

        .hero__title em .hero__char {
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          background-position: calc(var(--flow-x) + (var(--i) * 2.5%)) 50%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: heroCharIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-delay: calc(${CHAR_BASE_DELAY_S}s + (var(--i) * ${CHAR_STAGGER_S}s));
        }

        .hero__text {
          margin: 1.6rem 0 0;
          max-width: 42ch;
          font-family: 'Open Sans Variable', 'Open Sans Fallback', 'Open Sans', Arial, sans-serif;
          font-size: clamp(1rem, 1.4vw, 1.125rem);
          font-weight: 400;
          line-height: 1.65;
          color: color-mix(in srgb, var(--cor-texto) 86%, transparent);
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
          border-radius: var(--raio-botao);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.84rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease, color 0.2s ease;
        }

        .hero__btn--primary {
          background-image: var(--gradiente-botao);
          background-size: 240% 100%;
          animation: 9s infinite flow-shift-x;
          color: var(--cor-texto);
          box-shadow: var(--sombra-botao);
        }

        .hero__btn--primary:hover {
          filter: brightness(1.05);
          transform: translateY(-0.25rem);
          color: var(--cor-texto);
        }

        .hero__btn--secondary {
          background: transparent;
          color: var(--cor-texto);
          border: 1.5px solid var(--cor-borda);
        }

        .hero__btn--secondary:hover {
          border-color: var(--cor-texto);
          background: color-mix(in srgb, var(--cor-texto) 10%, transparent);
          color: var(--cor-texto);
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
          color: color-mix(in srgb, var(--cor-texto) 55%, transparent);
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
          background: color-mix(in srgb, var(--cor-texto) 22%, transparent);
          position: relative;
          overflow: hidden;
        }

        .hero__scroll-line::after {
          content: '';
          position: absolute;
          inset: 0 auto auto 0;
          width: 100%;
          height: 45%;
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: heroScroll 1.6s ease-in-out infinite, 11s infinite flow-shift-x;
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
