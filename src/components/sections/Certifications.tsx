import { useRef } from 'react';
import { animateSectionIntro } from '../../lib/animateIntro';
import { revealItems } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import { certifications } from '../../data/certifications';
import Picture from '../ui/Picture';


export default function Certifications() {
  const sectionRef = useRef<HTMLElement>(null);

  useSectionMotion(sectionRef, () => {
    animateSectionIntro(sectionRef.current?.querySelector('.certs__intro'));
    revealItems(sectionRef.current?.querySelectorAll('.certs__item'), {
      trigger: sectionRef.current?.querySelector('.certs__rail'),
      stagger: 0.1,
      y: 40,
      scale: 0.94,
      duration: 0.75,
    });
  });

  return (
    <section
      ref={sectionRef}
      id="certificacoes"
      data-section="certificacoes"
      aria-labelledby="certs-heading"
      className="section-padding certs"
    >
      <div className="container">
        <div className="certs__intro">
          <span className="eyebrow" data-reveal="eyebrow">Qualidade</span>
          <h2 id="certs-heading" data-reveal="heading">Certificações e parcerias</h2>
          <p data-reveal="text">Reconhecimentos que reforçam qualidade e confiabilidade em cada entrega.</p>
        </div>

        <ul className="certs__rail" aria-label="Certificações e parcerias">
          {certifications.map((item) => (
            <li key={item.id} className="certs__item" data-reveal="items">
              <div className="certs__logo">
                <Picture
                  name={item.imageName}
                  alt={item.alt}
                  sizes="120px"
                  loading="lazy"
                  className="certs__logo-img"
                  pictureClassName="certs__logo-picture"
                />
              </div>

              <div className="certs__meta">
                <strong>{item.name}</strong>
                <span>{item.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .certs {
          background:
            linear-gradient(180deg, var(--cor-fundo) 0%, var(--cor-superficie) 48%, var(--cor-fundo) 100%);
        }

        .certs__intro {
          max-width: 40rem;
          margin: 0 auto clamp(2.5rem, 5vw, 3.75rem);
          text-align: center;
        }

        .certs__intro .eyebrow {
          display: block;
          margin-bottom: 1rem;
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
        }

        .certs__intro h2 {
          margin: 0 auto 0.9rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 3.4vw, 2.75rem);
          color: var(--cor-texto);
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .certs__intro p {
          margin: 0 auto;
          max-width: 38ch;
          font-size: 1rem;
          color: var(--cor-texto-apoio);
          line-height: 1.7;
        }

        .certs__rail {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.85rem;
        }

        .certs__item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 1.15rem;
          min-height: 100%;
          padding: 1.75rem 1.35rem 1.45rem;
          border-radius: 18px;
          background: var(--cor-superficie);
          border: 1px solid var(--cor-borda);
          box-shadow:
            0 1px 0 color-mix(in srgb, var(--cor-texto) 80%, transparent) inset,
            0 14px 36px color-mix(in srgb, var(--cor-fundo-profundo) 5%, transparent);
          transition:
            transform 0.28s ease,
            border-color 0.28s ease,
            box-shadow 0.28s ease;
        }

        .certs__item:hover {
          transform: translateY(-4px);
          border-color: color-mix(in srgb, var(--cor-realce) 28%, transparent);
          box-shadow:
            0 1px 0 color-mix(in srgb, var(--cor-texto) 90%, transparent) inset,
            0 22px 44px color-mix(in srgb, var(--cor-realce) 12%, transparent);
        }

        .certs__logo {
          width: 100%;
          height: 5.5rem;
          display: grid;
          place-items: center;
        }

        .certs__logo picture {
          display: grid;
          place-items: center;
          width: auto;
          max-width: 100%;
          height: 5.5rem;
          margin-inline: auto;
        }

        .certs__logo img {
          max-width: 100%;
          max-height: 5.5rem;
          width: auto;
          height: auto;
          margin-inline: auto;
          object-fit: contain;
          object-position: center;
          filter: drop-shadow(0 8px 16px color-mix(in srgb, var(--cor-fundo-profundo) 8%, transparent));
          transition: transform 0.28s ease;
        }

        .certs__item:hover .certs__logo img {
          transform: scale(1.04);
        }

        .certs__meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          text-align: center;
        }

        .certs__meta strong {
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: 0.92rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cor-texto);
        }

        .certs__meta span {
          font-size: 0.78rem;
          color: var(--cor-texto-apoio);
          line-height: 1.4;
        }

        @media (min-width: 640px) {
          .certs__rail {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
          }
        }

        @media (min-width: 1024px) {
          .certs__rail {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 0;
            padding: 0.35rem;
            border-radius: 22px;
            background: var(--cor-superficie);
            border: 1px solid var(--cor-borda);
            box-shadow: 0 20px 50px color-mix(in srgb, var(--cor-fundo-profundo) 4%, transparent);
            overflow: hidden;
          }

          .certs__item {
            border-radius: 0;
            border: 0;
            box-shadow: none;
            background: transparent;
            padding: 2.1rem 1.5rem 1.75rem;
            position: relative;
          }

          .certs__item:not(:last-child)::after {
            content: '';
            position: absolute;
            top: 18%;
            right: 0;
            bottom: 18%;
            width: 1px;
            background: linear-gradient(
              180deg,
              transparent,
              color-mix(in srgb, var(--cor-fundo-profundo) 12%, transparent),
              transparent
            );
          }

          .certs__item:hover {
            transform: translateY(-2px);
            box-shadow: none;
            background: color-mix(in srgb, var(--cor-realce) 4%, transparent);
          }

          .certs__logo {
            height: 6rem;
          }

          .certs__logo img {
            max-height: 6rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .certs__item,
          .certs__logo img {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
