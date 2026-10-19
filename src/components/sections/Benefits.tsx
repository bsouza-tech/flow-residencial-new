import { useRef, type ReactElement } from 'react';
import { animateSectionIntro } from '../../lib/animateIntro';
import { revealItems, revealMedia } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import { benefits } from '../../data/benefits';
import Picture from '../ui/Picture';


const BenefitIcon = ({ id }: { id: string }) => {
  const icons: Record<string, ReactElement> = {
    seguranca: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    lazer: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
    condicoes: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    localizacao: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    conforto: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  };
  return icons[id] || icons.conforto;
};

export default function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useSectionMotion(sectionRef, () => {
    animateSectionIntro(headingRef.current);
    revealMedia(imageRef.current, { delay: 0.12, radius: 12 });
    revealItems(cardsRef.current?.querySelectorAll('.benefit-card'), {
      trigger: cardsRef.current,
      stagger: 0.12,
      y: 52,
    });
  });

  return (
    <section
      ref={sectionRef}
      id="beneficios"
      aria-labelledby="benefits-heading"
      className="section-padding"
      style={{ background: 'var(--cor-fundo)' }}
    >
      <div className="container">
        {/* Top editorial row */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', marginBottom: 'clamp(4rem, 6vw, 6rem)', alignItems: 'center' }}
          className="benefits-top"
        >
          {/* Left: heading */}
          <div ref={headingRef} style={{ maxWidth: '34rem' }}>
            <span className="eyebrow aurora-texto" data-reveal="eyebrow" style={{ display: 'block', marginBottom: '1.25rem' }}>
              Flow Residencial
            </span>
            <h2
              id="benefits-heading"
              className="benefits-heading"
              data-reveal="heading"
              style={{
                fontFamily: "'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(1.85rem, 3.6vw, 2.85rem)',
                color: 'var(--cor-texto)',
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                margin: '0 0 1.5rem 0',
              }}
            >
              <span className="gradient-text">Destaques</span> que elevam sua experiência de morar
            </h2>
            <p
              data-reveal="text"
              style={{
                margin: 0,
                color: 'var(--cor-texto-apoio)',
                fontSize: '1.05rem',
                lineHeight: 1.7,
              }}
            >
              No Flow, você escolhe entre quatro plantas versáteis que unem conforto, praticidade e design otimizado. Seja para morar sozinho ou para compartilhar, aqui você encontra o espaço ideal para viver com liberdade e fluidez.
            </p>
          </div>

          {/* Right: image */}
          <div
            ref={imageRef}
            data-reveal="media"
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              aspectRatio: '4/3',
              position: 'relative',
            }}
          >
            <Picture
              name="fachada-dois"
              alt="Fachada Letreiro do Flow Residencial"
              sizes="(max-width: 959px) 100vw, 50vw"
              loading="lazy"
              pictureClassName="benefits-top__picture"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />

            {/* Teal accent */}
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'var(--cor-superficie-vidro)', backdropFilter: 'blur(8px)', borderRadius: '6px', padding: '0.75rem 1.25rem' }}>
              <p className="aurora-texto" style={{ fontFamily: "'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', margin: 0 }}>
                TERESÓPOLIS — RJ
              </p>
            </div>
          </div>
        </div>

        {/* Benefit cards */}
        <div
          ref={cardsRef}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}
          className="benefits-grid"
        >
          {benefits.map((benefit) => (
            <article
              key={benefit.id}
              className="benefit-card"
              data-reveal="items"
              style={{
                background: 'var(--cor-superficie)',
                borderRadius: '12px',
                padding: '2rem',
                border: '1px solid color-mix(in srgb, var(--cor-realce) 14%, transparent)',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease, background 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px color-mix(in srgb, var(--cor-fundo-profundo) 8%, transparent)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.background = 'var(--cor-superficie)';
                (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--cor-realce) 28%, transparent)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.background = 'var(--cor-superficie)';
                (e.currentTarget as HTMLElement).style.borderColor = 'color-mix(in srgb, var(--cor-realce) 14%, transparent)';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: 'color-mix(in srgb, var(--cor-realce) 14%, transparent)',
                  color: 'var(--cor-realce)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  flexShrink: 0,
                }}
              >
                <BenefitIcon id={benefit.id} />
              </div>
              <h3 style={{ fontFamily: "'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif", fontWeight: 700, fontSize: '1.05rem', color: 'var(--cor-texto)', margin: benefit.description ? '0 0 0.75rem 0' : 0 }}>
                {benefit.title}
              </h3>
              {benefit.description ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--cor-texto-apoio)', lineHeight: 1.7, margin: 0 }}>
                  {benefit.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .benefits-heading .gradient-text,
        .benefits-heading .gradient-text .split-char {
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          animation: 11s infinite flow-shift-x;
        }

        .benefits-top__picture {
          display: block;
          width: 100%;
          height: 100%;
        }

        @media (min-width: 768px) {
          .benefits-top {
            grid-template-columns: 1fr 1fr !important;
          }
          .benefits-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .benefits-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
}
