import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { animateSectionIntro } from '../../lib/animateIntro';
import { revealColumns, revealItems } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import { floorPlans } from '../../data/floorPlans';
import Picture from '../ui/Picture';


export default function FloorPlans() {
  const [activeId, setActiveId] = useState(floorPlans[0]?.id ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelsReady = useRef(false);

  const activeIndex = Math.max(0, floorPlans.findIndex((p) => p.id === activeId));
  const activePlan = floorPlans[activeIndex] ?? floorPlans[0];

  useSectionMotion(sectionRef, () => {
    animateSectionIntro(sectionRef.current?.querySelector('.floorplans__intro'));
    revealItems(sectionRef.current?.querySelectorAll('.floorplans__tab'), {
      trigger: sectionRef.current?.querySelector('.floorplans__tabs'),
      stagger: 0.06,
      y: 28,
      scale: 0.97,
      duration: 0.55,
    });
    revealColumns(sectionRef.current?.querySelectorAll('.floorplans__visual, .floorplans__info'), {
      trigger: sectionRef.current?.querySelector('.floorplans__panel'),
      stagger: 0.14,
      duration: 0.9,
    });
    panelsReady.current = true;
  });

  useLayoutEffect(() => {
    if (!panelsReady.current || !detailRef.current) return;
    detailRef.current.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.setAttribute('data-revealed', '');
    });
  }, [activeId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (modalOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalOpen, activeIndex]);

  const handleTabChange = (id: string) => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduceMotion && detailRef.current) {
      gsap.fromTo(
        detailRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
    setActiveId(id);
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const showPrev = () => {
    const prev = (activeIndex - 1 + floorPlans.length) % floorPlans.length;
    setActiveId(floorPlans[prev].id);
  };

  const showNext = () => {
    const next = (activeIndex + 1) % floorPlans.length;
    setActiveId(floorPlans[next].id);
  };

  const selectInterest = () => {
    sessionStorage.setItem('bellavista-selected-plan', activePlan.id);
  };

  return (
    <section
      ref={sectionRef}
      id="plantas"
      aria-labelledby="floorplans-heading"
      className="section-padding floorplans"
    >
      <div className="container">
        <div className="floorplans__intro">
          <span className="eyebrow" data-reveal="eyebrow">Plantas</span>
          <h2 id="floorplans-heading" data-reveal="heading">Conheça as tipologias do Bellavista.</h2>
          <p data-reveal="text">Plantas funcionais, bem distribuídas e pensadas para o dia a dia da sua família.</p>
        </div>

        <div className="floorplans__tabs" role="tablist" aria-label="Tipologias de planta">
          {floorPlans.map((plan) => {
            const selected = activeId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                role="tab"
                id={`tab-${plan.id}`}
                aria-selected={selected}
                aria-controls={`panel-${plan.id}`}
                className={`floorplans__tab${selected ? ' is-active' : ''}`}
                data-reveal="items"
                onClick={() => handleTabChange(plan.id)}
              >
                {plan.name}
              </button>
            );
          })}
        </div>

        {activePlan && (
          <div
            id={`panel-${activePlan.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${activePlan.id}`}
            className="floorplans__panel"
            ref={detailRef}
          >
            <div className="floorplans__visual" data-reveal="col">
              <div className="floorplans__visual-label">
                <span>Planta baixa</span>
              </div>

              <div className="floorplans__card">
                <button
                  type="button"
                  className="floorplans__availability"
                  data-abrir-formulario=""
                  onClick={(event) => {
                    if (event.defaultPrevented) return;
                    selectInterest();
                    document.getElementById('interesse')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Consultar disponibilidade
                </button>

                <button
                  type="button"
                  className="floorplans__image-btn"
                  onClick={openModal}
                  aria-label={`Ampliar planta ${activePlan.name}`}
                >
                  <Picture
                    name={activePlan.imageName}
                    alt={`Planta ${activePlan.name} — ${activePlan.bedrooms} quartos, ${activePlan.bathrooms} banheiro, ${activePlan.area}`}
                    sizes="(max-width: 959px) 100vw, 55vw"
                    width={activePlan.imageWidth}
                    height={activePlan.imageHeight}
                    loading="lazy"
                    className="floorplans__img"
                  />

                </button>

                <button type="button" className="floorplans__expand" onClick={openModal}>
                  Ampliar planta
                </button>
              </div>
            </div>

            <div className="floorplans__info" data-reveal="col" data-reveal-side="end">
              <p className="floorplans__kicker">Tipologia</p>
              <h3 className="floorplans__name">{activePlan.name}</h3>

              <div className="floorplans__specs">
                <div className="floorplans__spec">
                  <span className="floorplans__spec-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 8h16v12H4zM8 8V5h8v3" />
                    </svg>
                  </span>
                  <div>
                    <strong>{activePlan.area}</strong>
                    <span>Área</span>
                  </div>
                </div>
                <div className="floorplans__spec">
                  <span className="floorplans__spec-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 20v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6" />
                      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                    </svg>
                  </span>
                  <div>
                    <strong>{activePlan.bedrooms}</strong>
                    <span>Quartos</span>
                  </div>
                </div>
                <div className="floorplans__spec">
                  <span className="floorplans__spec-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 12h16v7H4z" />
                      <path d="M7 12V8a2 2 0 0 1 2-2h1" />
                    </svg>
                  </span>
                  <div>
                    <strong>{activePlan.bathrooms}</strong>
                    <span>Banheiro</span>
                  </div>
                </div>
              </div>

              {activePlan.description && (
                <p className="floorplans__desc">{activePlan.description}</p>
              )}

              <ul className="floorplans__list">
                <li>{activePlan.bedrooms} quartos</li>
                <li>{activePlan.bathrooms} banheiro</li>
                <li>Área privativa de {activePlan.area}</li>
              </ul>

              <a
                href="#interesse"
                className="floorplans__cta"
                data-abrir-formulario=""
                onClick={(event) => {
                  if (event.defaultPrevented) return;
                  selectInterest();
                }}
              >
                Tenho interesse nesta planta
              </a>
            </div>
          </div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="floorplans-modal"
        aria-label={`Planta ampliada: ${activePlan?.name}`}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeModal();
        }}
        onCancel={(e) => {
          e.preventDefault();
          closeModal();
        }}
      >
        {activePlan && (
          <div className="floorplans-modal__shell">
            <button type="button" className="floorplans-modal__close" onClick={closeModal} aria-label="Fechar">
              ×
            </button>

            <button type="button" className="floorplans-modal__nav floorplans-modal__nav--prev" onClick={showPrev} aria-label="Planta anterior">
              ‹
            </button>

            <div className="floorplans-modal__content">
              <div className="floorplans-modal__meta">
                <div>
                  <p className="eyebrow">Tipologia</p>
                  <h3>{activePlan.name}</h3>
                </div>
                <p className="floorplans-modal__counter">
                  {activeIndex + 1} / {floorPlans.length}
                </p>
              </div>

              <div className="floorplans-modal__specs">
                <span>{activePlan.bedrooms} quartos</span>
                <span>{activePlan.bathrooms} banheiro</span>
                <span>{activePlan.area}</span>
              </div>

              <div className="floorplans-modal__image">
                <Picture
                  name={activePlan.imageName}
                  alt={`Planta ampliada ${activePlan.name}`}
                  sizes="90vw"
                  width={activePlan.imageWidth}
                  height={activePlan.imageHeight}
                  loading="eager"
                  className="floorplans__img"
                />
              </div>


              <div className="floorplans-modal__tabs">
                {floorPlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    className={`floorplans-modal__tab${plan.id === activePlan.id ? ' is-active' : ''}`}
                    onClick={() => setActiveId(plan.id)}
                  >
                    {plan.name}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" className="floorplans-modal__nav floorplans-modal__nav--next" onClick={showNext} aria-label="Próxima planta">
              ›
            </button>
          </div>
        )}
      </dialog>

      <style>{`
        .floorplans {
          background: #ffffff;
        }

        .floorplans__intro {
          max-width: 40rem;
          margin: 0 auto clamp(2rem, 4vw, 3rem);
          text-align: center;
        }

        .floorplans__intro .eyebrow {
          color: #19808c;
          display: block;
        }

        .floorplans__intro h2 {
          margin: 1rem 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 3.5vw, 3rem);
          color: #013034;
          line-height: 1.15;
        }

        .floorplans__intro p {
          margin: 0 auto;
          max-width: 36ch;
          color: #4a5a61;
          line-height: 1.7;
        }

        .floorplans__tabs {
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          padding-bottom: 0.35rem;
          margin-bottom: clamp(1.75rem, 3vw, 2.5rem);
        }

        .floorplans__tab {
          flex: 0 0 auto;
          min-height: 44px;
          padding: 0.7rem 1.2rem;
          border: 1.5px solid #013034;
          border-radius: 4px;
          background: transparent;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .floorplans__tab.is-active {
          background: #013034;
          color: #ffffff;
        }

        .floorplans__panel {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(2rem, 4vw, 3.5rem);
          align-items: start;
        }

        .floorplans__visual-label {
          margin-bottom: 0.85rem;
        }

        .floorplans__visual-label span {
          display: inline-block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #013034;
          padding-bottom: 0.45rem;
          border-bottom: 1px solid rgba(1, 48, 52, 0.25);
        }

        .floorplans__card {
          position: relative;
          background: #ffffff;
          border-radius: 12px;
          padding: clamp(1rem, 2vw, 1.5rem);
          box-shadow: 0 10px 30px rgba(1, 48, 52, 0.06);
        }

        .floorplans__availability {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 2;
          min-height: 40px;
          padding: 0.55rem 0.95rem;
          border: 0;
          border-radius: 4px;
          background: #013034;
          color: #ffffff;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .floorplans__image-btn {
          display: block;
          width: 100%;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: zoom-in;
        }

        .floorplans__image-btn picture {
          display: block;
          width: 100%;
        }

        .floorplans__image-btn img {
          width: 100%;
          height: auto;
          max-height: 560px;
          object-fit: contain;
          display: block;
        }

        .floorplans__expand {
          margin-top: 0.85rem;
          border: 0;
          background: transparent;
          color: #19808c;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 0.2em;
          cursor: pointer;
        }

        .floorplans__kicker {
          margin: 0 0 0.65rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #5b7a7b;
        }

        .floorplans__name {
          margin: 0 0 1.5rem;
          display: inline-block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.75rem);
          font-weight: 800;
          color: #013034;
          line-height: 1.1;
          padding-bottom: 0.55rem;
          border-bottom: 4px solid #013034;
        }

        .floorplans__specs {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0.75rem;
          padding: 1rem 1.1rem;
          margin-bottom: 1.5rem;
          background: #f4efe3;
          border-radius: 10px;
        }

        .floorplans__spec {
          display: flex;
          align-items: center;
          gap: 0.7rem;
        }

        .floorplans__spec-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(1, 48, 52, 0.08);
          color: #013034;
          flex-shrink: 0;
        }

        .floorplans__spec strong {
          display: block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: #013034;
          line-height: 1.1;
        }

        .floorplans__spec span:last-child {
          display: block;
          margin-top: 0.15rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          /* #f4efe3 (fundo specs): #5b7a7b = 4,05:1 → #527072 = 4,67:1 */
          color: #527072;
        }

        .floorplans__desc {
          margin: 0 0 1.25rem;
          color: #4a5a61;
          line-height: 1.75;
          font-size: 0.98rem;
        }

        .floorplans__list {
          list-style: none;
          margin: 0 0 1.75rem;
          padding: 0;
          display: grid;
          gap: 0.65rem;
        }

        .floorplans__list li {
          position: relative;
          padding-left: 1.15rem;
          color: #2c2f31;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .floorplans__list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 0.45rem;
          height: 0.45rem;
          border-radius: 999px;
          background: #eb9c36;
        }

        .floorplans__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0.85rem 1.5rem;
          border-radius: 999px;
          background: #eb9c36;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
        }

        .floorplans__cta:hover {
          background: #d88928;
          color: #013034;
        }

        .floorplans-modal {
          width: min(96vw, 1080px);
          max-height: 92dvh;
          margin: auto;
          padding: 0;
          border: 0;
          border-radius: 16px;
          background: #ffffff;
          color: #013034;
          overflow: hidden;
        }

        .floorplans-modal::backdrop {
          background: rgba(1, 48, 52, 0.72);
          backdrop-filter: blur(6px);
        }

        .floorplans-modal:not([open]) {
          display: none;
        }

        .floorplans-modal__shell {
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.5rem;
          padding: 1.25rem 0.75rem;
        }

        .floorplans-modal__content {
          min-width: 0;
          display: grid;
          gap: 1rem;
        }

        .floorplans-modal__meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 1rem;
          padding-inline: 0.5rem;
        }

        .floorplans-modal__meta .eyebrow {
          color: #19808c;
          margin: 0 0 0.35rem;
        }

        .floorplans-modal__meta h3 {
          margin: 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 800;
        }

        .floorplans-modal__counter {
          margin: 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #5b7a7b;
        }

        .floorplans-modal__specs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-inline: 0.5rem;
        }

        .floorplans-modal__specs span {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0.35rem 0.8rem;
          border-radius: 999px;
          background: #faf7f0;
          border: 1px solid #e4d7b6;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
        }

        .floorplans-modal__image {
          background: #f7f6f2;
          border-radius: 12px;
          padding: 0.75rem;
          max-height: min(58dvh, 620px);
          overflow: auto;
        }

        .floorplans-modal__image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .floorplans-modal__tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          padding-inline: 0.5rem;
        }

        .floorplans-modal__tab {
          min-height: 36px;
          padding: 0.4rem 0.85rem;
          border: 1px solid #013034;
          border-radius: 4px;
          background: transparent;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .floorplans-modal__tab.is-active {
          background: #013034;
          color: #ffffff;
        }

        .floorplans-modal__close,
        .floorplans-modal__nav {
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 999px;
          background: rgba(1, 48, 52, 0.08);
          color: #013034;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
        }

        .floorplans-modal__close {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          z-index: 2;
        }

        @media (min-width: 960px) {
          .floorplans__panel {
            grid-template-columns: 1.15fr 0.85fr;
            gap: 3.5rem;
            align-items: center;
          }
        }

        @media (max-width: 700px) {
          .floorplans__specs {
            grid-template-columns: 1fr;
          }

          .floorplans__availability {
            position: static;
            width: 100%;
            margin-bottom: 0.85rem;
          }

          .floorplans-modal__shell {
            grid-template-columns: 1fr;
            padding-top: 3.25rem;
          }

          .floorplans-modal__nav--prev,
          .floorplans-modal__nav--next {
            position: absolute;
            bottom: 1rem;
          }

          .floorplans-modal__nav--prev { left: 1rem; }
          .floorplans-modal__nav--next { right: 1rem; }

          .floorplans-modal__content {
            padding-bottom: 3.5rem;
          }
        }
      `}</style>
    </section>
  );
}
