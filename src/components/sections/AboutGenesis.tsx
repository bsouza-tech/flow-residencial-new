import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { animateSectionIntro } from '../../lib/animateIntro';
import { revealColumns, revealMedia } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import { genesisStats } from '../../data/genesisStats';
import Picture from '../ui/Picture';


const GENESIS_VIDEO_ID = 'KVty8Cw8PX0';

export default function AboutGenesis() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (videoOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [videoOpen]);

  useSectionMotion(sectionRef, () => {
    animateSectionIntro(sectionRef.current?.querySelector('.about__intro'));

    revealColumns(sectionRef.current?.querySelectorAll('.about__col'), {
      trigger: sectionRef.current?.querySelector('.about__grid'),
      stagger: 0.12,
      duration: 0.9,
    });

    revealMedia(sectionRef.current?.querySelector('.about__media'), {
      trigger: sectionRef.current?.querySelector('.about__grid'),
      delay: 0.1,
      radius: 16,
    });

    if (statsRef.current) {
      const statEls = statsRef.current.querySelectorAll('.about__stat-value');
      statEls.forEach((el, i) => {
        const stat = genesisStats[i];
        if (!stat) return;
        const counter = { val: 0 };
        gsap.to(counter, {
          val: stat.value,
          duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${Math.round(counter.val).toLocaleString('pt-BR')}${stat.suffix}`;
          },
          scrollTrigger: { trigger: statsRef.current, start: 'top 85%', once: true },
        });
      });
    }
  });

  return (
    <section
      ref={sectionRef}
      id="sobre"
      aria-labelledby="about-heading"
      className="section-padding about"
    >
      <div className="container">
        <div className="about__intro">
          <h2 id="about-heading" data-reveal="heading">Confiança e Tradição da Construtora</h2>
          <p data-reveal="text">
            Mais de 16 anos unindo tradição e inovação, com milhares de famílias atendidas e lares entregues.
          </p>
        </div>

        <div className="about__grid">
          <div className="about__col" data-reveal="col">
            <article className="about__card">
              <h3>Sobre Gênesis</h3>
              <p>
                A Gênesis Incorporadora é sinônimo de excelência no mercado imobiliário, com mais de uma década construindo sonhos e transformando vidas.
              </p>
            </article>

            <div className="about__card about__stats" ref={statsRef}>
              {genesisStats.map((stat, index) => (
                <div key={stat.label} className="about__stat">
                  {index > 0 && <span className="about__stat-divider" aria-hidden="true" />}
                  <p className="about__stat-value">
                    {stat.value.toLocaleString('pt-BR')}
                    {stat.suffix}
                  </p>
                  <p className="about__stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="about__media" data-reveal="media" data-reveal-side="end">
            <button
              type="button"
              className="about__media-btn"
              onClick={() => setVideoOpen(true)}
              aria-label="Assistir ao vídeo da Gênesis Incorporadora"
            >
              <Picture
                name="fachada-dois"
                alt="Fachada do Solar Bellavista, empreendimento da Gênesis Incorporadora"
                sizes="(max-width: 959px) 100vw, 50vw"
                loading="lazy"
                className="about__media-img"
              />
              <span className="about__play" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 6.8v10.4L18 12 8.5 6.8Z" />
                </svg>
              </span>
            </button>
          </div>

        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="about-video"
        aria-label="Vídeo da Gênesis Incorporadora"
        onClick={(e) => {
          if (e.target === dialogRef.current) setVideoOpen(false);
        }}
        onClose={() => setVideoOpen(false)}
      >
        <div className="about-video__shell">
          <button type="button" className="about-video__close" onClick={() => setVideoOpen(false)} aria-label="Fechar vídeo">
            ×
          </button>
          {videoOpen && (
            <iframe
              className="about-video__frame"
              src={`https://www.youtube-nocookie.com/embed/${GENESIS_VIDEO_ID}?autoplay=1&rel=0`}
              title="Vídeo da Gênesis Incorporadora"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </dialog>

      <style>{`
        .about {
          background: #ffffff;
        }

        .about__intro {
          max-width: 40rem;
          margin: 0 auto clamp(2.5rem, 5vw, 3.5rem);
          text-align: center;
        }

        .about__intro h2 {
          margin: 0 auto 1rem;
          max-width: 18ch;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 3.5vw, 2.85rem);
          color: #013034;
          line-height: 1.15;
        }

        .about__intro p {
          margin: 0 auto;
          max-width: 46ch;
          font-size: 1rem;
          color: #4a5a61;
          line-height: 1.7;
        }

        .about__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.25rem;
          align-items: start;
        }

        .about__col {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          min-width: 0;
          height: fit-content;
        }

        .about__card {
          background: #ffffff;
          border: 1px solid rgba(1, 48, 52, 0.06);
          border-radius: 18px;
          padding: clamp(1.35rem, 3vw, 1.85rem);
          box-shadow: 0 12px 32px rgba(1, 48, 52, 0.06);
        }

        .about__card h3 {
          margin: 0 0 0.75rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: 1.15rem;
          color: #013034;
        }

        .about__card > p {
          margin: 0;
          font-size: 0.95rem;
          color: #4a5a61;
          line-height: 1.7;
        }

        .about__stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: clamp(1.5rem, 3vw, 2rem) clamp(1rem, 2.5vw, 1.5rem);
          align-items: center;
        }

        .about__stat {
          position: relative;
          text-align: center;
          padding: 0.35rem 0.75rem;
        }

        .about__stat-divider {
          position: absolute;
          left: 0;
          top: 12%;
          bottom: 12%;
          width: 1px;
          background: #e4d7b6;
        }

        .about__stat-value {
          margin: 0 0 0.35rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.85rem, 3vw, 2.35rem);
          color: #013034;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .about__stat-label {
          margin: 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #5b7a7b;
        }

        .about__media {
          position: relative;
          border-radius: 18px;
          overflow: hidden;
          aspect-ratio: 4 / 3;
          box-shadow: 0 16px 40px rgba(1, 48, 52, 0.1);
          background: #e8e4d8;
        }

        .about__media picture {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
        }

        .about__media-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }


        .about__media-btn {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          padding: 0;
          border: 0;
          background: none;
          cursor: pointer;
          color: inherit;
        }

        .about__media-btn:focus-visible {
          outline: 3px solid #eb9c36;
          outline-offset: -3px;
        }

        .about__play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 64px;
          height: 64px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          color: #013034;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 28px rgba(1, 48, 52, 0.22);
          pointer-events: none;
          transition: transform 0.2s ease;
        }

        .about__media-btn:hover .about__play,
        .about__media-btn:focus-visible .about__play {
          transform: translate(-50%, -50%) scale(1.06);
        }

        .about-video {
          width: min(960px, calc(100vw - 2rem));
          height: fit-content;
          max-height: calc(100dvh - 2rem);
          margin: auto;
          padding: 0;
          border: 0;
          background: transparent;
        }

        .about-video::backdrop {
          background: rgba(1, 48, 52, 0.72);
        }

        .about-video__shell {
          position: relative;
          aspect-ratio: 16 / 9;
          background: #013034;
          border-radius: 16px;
          overflow: hidden;
        }

        .about-video__frame {
          width: 100%;
          height: 100%;
          border: 0;
          display: block;
        }

        .about-video__close {
          position: absolute;
          top: 0.65rem;
          right: 0.65rem;
          z-index: 1;
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          color: #013034;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
        }

        .about__play svg {
          margin-left: 3px;
        }

        @media (min-width: 900px) {
          .about__grid {
            grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.15fr);
            gap: 1.5rem;
            align-items: stretch;
          }

          .about__col {
            height: auto;
          }

          .about__media {
            aspect-ratio: auto;
            height: auto;
            min-height: 0;
            align-self: stretch;
          }
        }
      `}</style>
    </section>
  );
}
