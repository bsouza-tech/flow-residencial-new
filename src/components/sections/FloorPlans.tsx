import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { animateSectionIntro } from '../../lib/animateIntro';
import { revealColumns, revealItems } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import { floorPlans } from '../../data/floorPlans';
import Picture from '../ui/Picture';

function quartos(n: number) {
  return n === 1 ? '1 quarto' : `${n} quartos`;
}

function suites(n: number) {
  return n === 1 ? '1 suíte' : `${n} suítes`;
}

function banheiros(n: number) {
  return n === 1 ? '1 banheiro' : `${n} banheiros`;
}

export default function FloorPlans() {
  const [activeId, setActiveId] = useState(floorPlans[0]?.id ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restaurarFocoPlanta = useRef(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const panelsReady = useRef(false);
  const afterCloseRef = useRef<string | null>(null);
  const slideDir = useRef(1);
  const [indicator, setIndicator] = useState({ x: 0, y: 0, w: 0, h: 0, ready: false });

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
    const root = tabsRef.current;
    if (!root) return;
    const active = root.querySelector<HTMLElement>('.floorplans__tab.is-active');
    if (!active) return;
    setIndicator({
      x: active.offsetLeft,
      y: active.offsetTop,
      w: active.offsetWidth,
      h: active.offsetHeight,
      ready: true,
    });
  }, [activeId]);

  useEffect(() => {
    const root = tabsRef.current;
    if (!root) return;
    const place = () => {
      const active = root.querySelector<HTMLElement>('.floorplans__tab.is-active');
      if (!active) return;
      setIndicator((current) => ({
        x: active.offsetLeft,
        y: active.offsetTop,
        w: active.offsetWidth,
        h: active.offsetHeight,
        ready: current.ready,
      }));
    };
    const observer = new ResizeObserver(place);
    observer.observe(root);
    window.addEventListener('resize', place);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', place);
    };
  }, [activeId]);

  useLayoutEffect(() => {
    if (!panelsReady.current || !detailRef.current) return;
    detailRef.current.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      el.setAttribute('data-revealed', '');
    });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;
    gsap.fromTo(
      detailRef.current,
      { opacity: 0, x: 28 * slideDir.current },
      { opacity: 1, x: 0, duration: 0.42, ease: 'power3.out', overwrite: 'auto' }
    );
  }, [activeId]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const lockScroll = () => {
      const y = window.scrollY;
      const gap = window.innerWidth - document.documentElement.clientWidth;
      document.body.dataset.scrollLock = String(y);
      document.documentElement.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${y}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    };

    const unlockScroll = () => {
      const y = Number(document.body.dataset.scrollLock || '0');
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      delete document.body.dataset.scrollLock;
      const scrolling = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      document.documentElement.style.scrollBehavior = scrolling;
    };

    let settled = false;
    let cancelled = false;
    let timer = 0;
    const onEnd = (event: AnimationEvent) => {
      if (event.target !== dialog || event.animationName !== 'floorplanOut') return;
      finishClose();
    };

    const finishClose = () => {
      if (settled || cancelled) return;
      settled = true;
      window.clearTimeout(timer);
      dialog.removeEventListener('animationend', onEnd);
      dialog.classList.remove('is-closing');
      if (dialog.open) dialog.close();
      const widgetAberto = [...document.querySelectorAll('div')].find((node) => {
        const overlay = node.shadowRoot?.querySelector('.overlay');
        return Boolean(overlay && !overlay.hidden);
      });
      widgetAberto?.shadowRoot?.querySelector<HTMLElement>('#gf-title')?.focus({ preventScroll: true });
      unlockScroll();
      const hash = afterCloseRef.current;
      afterCloseRef.current = null;
      if (!hash) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.querySelector(hash)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    };

    if (modalOpen) {
      if (!document.body.dataset.scrollLock) lockScroll();
      dialog.classList.remove('is-closing');
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open || document.body.dataset.scrollLock) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !dialog.open) {
        finishClose();
      } else {
        dialog.classList.add('is-closing');
        dialog.addEventListener('animationend', onEnd);
        timer = window.setTimeout(finishClose, 420);
      }
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      dialog.removeEventListener('animationend', onEnd);
    };
  }, [modalOpen]);

  useEffect(() => {
    return () => {
      if (!document.body.dataset.scrollLock) return;
      const y = Number(document.body.dataset.scrollLock);
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.paddingRight = '';
      delete document.body.dataset.scrollLock;
      const scrolling = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, y);
      document.documentElement.style.scrollBehavior = scrolling;
    };
  }, []);

  useEffect(() => {
    const onFormsEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail;
      if (detail?.type !== 'closed' || !restaurarFocoPlanta.current) return;
      restaurarFocoPlanta.current = false;
      window.setTimeout(() => {
        if (dialogRef.current?.open) return;
        const active = document.activeElement;
        const insideDialog = Boolean(active && dialogRef.current?.contains(active));
        const hostDoWidget = active instanceof HTMLElement && Boolean(active.shadowRoot?.querySelector('#gf-title'));
        if (active !== document.body && !insideDialog && !hostDoWidget) return;
        sectionRef.current?.querySelector<HTMLElement>('.floorplans__image-btn')?.focus({ preventScroll: true });
      }, 160);
    };
    window.addEventListener('genese-forms:event', onFormsEvent);
    return () => window.removeEventListener('genese-forms:event', onFormsEvent);
  }, []);

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
    if (id === activeId) return;
    const nextIndex = floorPlans.findIndex((plan) => plan.id === id);
    slideDir.current = nextIndex >= activeIndex ? 1 : -1;
    setActiveId(id);
  };

  const openModal = () => setModalOpen(true);
  const closeModal = (hash?: string) => {
    afterCloseRef.current = hash ?? null;
    setModalOpen(false);
  };

  const showPrev = () => {
    const prev = (activeIndex - 1 + floorPlans.length) % floorPlans.length;
    handleTabChange(floorPlans[prev].id);
  };

  const showNext = () => {
    const next = (activeIndex + 1) % floorPlans.length;
    handleTabChange(floorPlans[next].id);
  };

  const selectInterest = () => {
    sessionStorage.setItem('flow-selected-plan', activePlan.id);
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
          <h2 id="floorplans-heading" data-reveal="heading">Plantas para todos os estilos de vida</h2>
          <p data-reveal="text">
            No Flow, você escolhe entre quatro plantas versáteis que unem conforto, praticidade e design otimizado. Seja para morar sozinho ou para compartilhar, aqui você encontra o espaço ideal para viver com liberdade e fluidez.
          </p>
        </div>

        <div ref={tabsRef} className="floorplans__tabs" role="tablist" aria-label="Tipologias de planta">
          <span
            className={`floorplans__tab-indicator${indicator.ready ? ' is-ready' : ''}`}
            aria-hidden="true"
            style={{
              width: indicator.w,
              height: indicator.h,
              transform: `translate(${indicator.x}px, ${indicator.y}px)`,
            }}
          />
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
                  className="floorplans__image-btn"
                  onClick={openModal}
                  aria-label={`Ampliar planta ${activePlan.name}`}
                >
                  <Picture
                    name={activePlan.imageName}
                    alt={`Planta ${activePlan.name}`}
                    sizes="(max-width: 959px) 100vw, 55vw"
                    width={activePlan.imageWidth}
                    height={activePlan.imageHeight}
                    loading="lazy"
                    className="floorplans__img"
                  />

                </button>
              </div>
            </div>

            <div className="floorplans__info" data-reveal="col" data-reveal-side="end">
              <p className="floorplans__kicker">Tipologia</p>
              <h3 className="floorplans__name">{activePlan.name}</h3>

              {(activePlan.area || activePlan.bedrooms != null || activePlan.suites != null || activePlan.bathrooms != null) && (
              <div className="floorplans__specs">
                {activePlan.area && (
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
                )}
                {activePlan.bedrooms != null && (
                <div className="floorplans__spec">
                  <span className="floorplans__spec-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 20v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6" />
                      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                    </svg>
                  </span>
                  <div>
                    <strong>{quartos(activePlan.bedrooms)}</strong>
                    <span>Quartos</span>
                  </div>
                </div>
                )}
                {activePlan.suites != null && (
                <div className="floorplans__spec">
                  <span className="floorplans__spec-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 20V10l8-6 8 6v10" />
                      <path d="M9 20v-6h6v6" />
                    </svg>
                  </span>
                  <div>
                    <strong>{suites(activePlan.suites)}</strong>
                    <span>Suítes</span>
                  </div>
                </div>
                )}
                {activePlan.bathrooms != null && (
                <div className="floorplans__spec">
                  <span className="floorplans__spec-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 12h16v7H4z" />
                      <path d="M7 12V8a2 2 0 0 1 2-2h1" />
                    </svg>
                  </span>
                  <div>
                    <strong>{banheiros(activePlan.bathrooms)}</strong>
                    <span>Banheiros</span>
                  </div>
                </div>
                )}
              </div>
              )}

              {activePlan.description && (
                <p className="floorplans__desc">{activePlan.description}</p>
              )}

              {(activePlan.bedrooms != null || activePlan.suites != null || activePlan.bathrooms != null || activePlan.area) && (
              <ul className="floorplans__list">
                {activePlan.bedrooms != null && <li>{quartos(activePlan.bedrooms)}</li>}
                {activePlan.suites != null && <li>{suites(activePlan.suites)}</li>}
                {activePlan.bathrooms != null && <li>{banheiros(activePlan.bathrooms)}</li>}
                {activePlan.area && <li>Área privativa de {activePlan.area}</li>}
              </ul>
              )}

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
            <button type="button" className="floorplans-modal__close" onClick={() => closeModal()} aria-label="Fechar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="floorplans-modal__stage">
              <button type="button" className="floorplans-modal__nav floorplans-modal__nav--prev" onClick={showPrev} aria-label="Planta anterior">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <div className="floorplans-modal__image">
                <Picture
                  name={activePlan.imageName}
                  alt={`Planta ampliada ${activePlan.name}`}
                  sizes="(max-width: 800px) 92vw, 58vw"
                  width={activePlan.imageWidth}
                  height={activePlan.imageHeight}
                  loading="eager"
                  className="floorplans__img"
                />
              </div>
              <button type="button" className="floorplans-modal__nav floorplans-modal__nav--next" onClick={showNext} aria-label="Próxima planta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <aside className="floorplans-modal__panel">
              <p className="floorplans-modal__kicker">Flow Residencial</p>
              <h3>{activePlan.name}</h3>
              {activePlan.area && (
                <p className="floorplans-modal__area">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M4 8h16v12H4zM8 8V5h8v3" />
                  </svg>
                  {activePlan.area}
                </p>
              )}

              <ul className="floorplans-modal__specs">
                {activePlan.bedrooms != null && (
                  <li>
                    <span className="floorplans-modal__spec-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 20v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6" />
                        <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                      </svg>
                    </span>
                    <span>
                      <small>Quartos</small>
                      <strong>{quartos(activePlan.bedrooms)}</strong>
                    </span>
                  </li>
                )}
                {activePlan.suites != null && (
                  <li>
                    <span className="floorplans-modal__spec-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 20V10l8-6 8 6v10" />
                        <path d="M9 20v-6h6v6" />
                      </svg>
                    </span>
                    <span>
                      <small>Suítes</small>
                      <strong>{suites(activePlan.suites)}</strong>
                    </span>
                  </li>
                )}
                {activePlan.bathrooms != null && (
                  <li>
                    <span className="floorplans-modal__spec-icon" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 12h16v7H4z" />
                        <path d="M7 12V8a2 2 0 0 1 2-2h1" />
                      </svg>
                    </span>
                    <span>
                      <small>Banheiros</small>
                      <strong>{banheiros(activePlan.bathrooms)}</strong>
                    </span>
                  </li>
                )}
              </ul>

              <div className="floorplans-modal__tabs" role="tablist" aria-label="Outras plantas">
                {floorPlans.map((plan, index) => (
                  <button
                    key={plan.id}
                    type="button"
                    role="tab"
                    aria-selected={plan.id === activePlan.id}
                    className={`floorplans-modal__tab${plan.id === activePlan.id ? ' is-active' : ''}`}
                    onClick={() => setActiveId(plan.id)}
                  >
                    {plan.name}
                    <span className="floorplans-modal__tab-index">{index + 1}</span>
                  </button>
                ))}
              </div>

              <a
                href="#interesse"
                className="floorplans__cta floorplans-modal__cta"
                data-abrir-formulario=""
                onClick={(event) => {
                  event.preventDefault();
                  restaurarFocoPlanta.current = true;
                  selectInterest();
                  closeModal('#interesse');
                }}
              >
                Tenho interesse nesta planta
              </a>
            </aside>
          </div>
        )}
      </dialog>

      <style>{`
        .floorplans {
          background: var(--cor-fundo);
        }

        .floorplans__intro {
          max-width: 40rem;
          margin: 0 auto clamp(2rem, 4vw, 3rem);
          text-align: center;
        }

        .floorplans__intro .eyebrow {
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
          display: block;
        }

        .floorplans__intro h2 {
          margin: 1rem 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 3.5vw, 3rem);
          color: var(--cor-texto);
          line-height: 1.15;
        }

        .floorplans__intro p {
          margin: 0 auto;
          max-width: 36ch;
          color: var(--cor-texto-apoio);
          line-height: 1.7;
        }

        .floorplans__tabs {
          position: relative;
          display: flex;
          gap: 0.65rem;
          overflow-x: auto;
          padding-bottom: 0.35rem;
          margin-bottom: clamp(1.75rem, 3vw, 2.5rem);
        }

        .floorplans__tab-indicator {
          position: absolute;
          left: 0;
          top: 0;
          z-index: 0;
          pointer-events: none;
          border-radius: var(--raio-botao);
          background-image: var(--gradiente-botao);
          background-size: 240% 100%;
          animation: 9s infinite flow-shift-x;
        }

        .floorplans__tab-indicator.is-ready {
          transition:
            transform 0.48s cubic-bezier(0.22, 1, 0.36, 1),
            width 0.48s cubic-bezier(0.22, 1, 0.36, 1),
            height 0.48s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .floorplans__tab {
          position: relative;
          z-index: 1;
          flex: 0 0 auto;
          min-height: 44px;
          padding: 0.7rem 1.2rem;
          border: 1.5px solid var(--cor-borda);
          border-radius: var(--raio-botao);
          background: transparent;
          color: var(--cor-texto);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.35s ease, color 0.35s ease;
        }

        .floorplans__tab.is-active {
          border-color: transparent;
          color: var(--cor-texto);
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
          color: var(--cor-texto);
          padding-bottom: 0.45rem;
          border-bottom: 1px solid color-mix(in srgb, var(--cor-fundo-profundo) 25%, transparent);
        }

        .floorplans__card {
          position: relative;
          background: var(--cor-fundo);
          border-radius: 12px;
          padding: clamp(1rem, 2vw, 1.5rem);
          box-shadow: 0 10px 30px color-mix(in srgb, var(--cor-fundo-profundo) 6%, transparent);
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
          background: var(--cor-fundo-profundo);
          color: var(--cor-texto);
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

        .floorplans__kicker {
          margin: 0 0 0.65rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--cor-texto-apoio);
        }

        .floorplans__name {
          margin: 0 0 1.5rem;
          display: inline-block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.75rem);
          font-weight: 800;
          color: var(--cor-texto);
          line-height: 1.1;
          padding-bottom: 0.55rem;
          border-bottom: 4px solid var(--cor-texto);
        }

        .floorplans__specs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem 1rem;
          padding: 1rem 1.1rem;
          margin-bottom: 1.5rem;
          background: var(--cor-superficie);
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
          background: color-mix(in srgb, var(--cor-fundo-profundo) 8%, transparent);
          color: var(--cor-texto);
          flex-shrink: 0;
        }

        .floorplans__spec strong {
          display: block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--cor-texto);
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
          /* var(--cor-superficie) (fundo specs): var(--cor-texto-apoio) = 4,05:1 → var(--cor-texto-apoio) = 4,67:1 */
          color: var(--cor-texto-apoio);
        }

        .floorplans__desc {
          margin: 0 0 1.25rem;
          color: var(--cor-texto-apoio);
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
          color: var(--cor-texto);
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
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: 11s infinite flow-shift-x;
        }

        .floorplans__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0.85rem 1.5rem;
          border-radius: var(--raio-botao);
          background-image: var(--gradiente-botao);
          background-size: 240% 100%;
          animation: 9s infinite flow-shift-x;
          box-shadow: var(--sombra-botao);
          color: var(--cor-texto);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          text-decoration: none;
        }

        .floorplans__cta:hover {
          filter: brightness(1.05);
          transform: translateY(-0.25rem);
          color: var(--cor-texto);
        }

        @keyframes floorplanIn {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to { opacity: 1; transform: none; }
        }

        @keyframes floorplanOut {
          from { opacity: 1; transform: none; }
          to { opacity: 0; transform: translateY(18px) scale(0.98); }
        }

        @keyframes floorplanBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes floorplanBackdropOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes floorplanSheetIn {
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: none; }
        }

        @keyframes floorplanPanelIn {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: none; }
        }

        .floorplans-modal {
          width: min(96vw, 1080px);
          max-height: 92dvh;
          margin: auto;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: var(--cor-fundo);
          color: var(--cor-texto);
          overflow: hidden;
          overscroll-behavior: contain;
          box-shadow: 0 28px 70px color-mix(in srgb, black 48%, transparent);
          animation: floorplanIn 0.46s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .floorplans-modal::backdrop {
          background: color-mix(in srgb, #07080e 82%, transparent);
          animation: floorplanBackdropIn 0.4s ease both;
        }

        .floorplans-modal.is-closing {
          animation: floorplanOut 0.32s cubic-bezier(0.4, 0, 1, 1) forwards;
        }

        .floorplans-modal.is-closing::backdrop {
          animation: floorplanBackdropOut 0.32s ease forwards;
        }

        .floorplans-modal[open] .floorplans-modal__image {
          animation: floorplanSheetIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .floorplans-modal[open] .floorplans-modal__panel {
          animation: floorplanPanelIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
        }

        .floorplans-modal:not([open]) {
          display: none;
        }

        .floorplans-modal__shell {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
          max-height: 92dvh;
          align-items: stretch;
        }

        .floorplans-modal__stage {
          position: relative;
          display: grid;
          place-items: center;
          align-self: stretch;
          min-height: 100%;
          padding: 2.25rem 4.25rem;
          background: #e8eef1;
        }

        .floorplans-modal__image {
          width: 100%;
          max-height: min(72dvh, 640px);
          overflow: auto;
        }

        .floorplans-modal__image img {
          width: 100%;
          height: auto;
          max-height: min(68dvh, 600px);
          object-fit: contain;
          display: block;
        }

        .floorplans-modal__panel {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          min-width: 0;
          padding: 3.25rem 1.5rem 1.5rem;
          overflow: auto;
        }

        .floorplans-modal__kicker {
          margin: 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
        }

        .floorplans-modal__panel h3 {
          margin: 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: clamp(1.55rem, 2.4vw, 2.1rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .floorplans-modal__area {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin: 0;
          color: var(--cor-texto-apoio);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .floorplans-modal__specs {
          display: grid;
          gap: 0.6rem;
          margin: 0.35rem 0 0;
          padding: 0;
          list-style: none;
        }

        .floorplans-modal__specs li {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 0.9rem;
          border-radius: 14px;
          background: var(--cor-superficie);
        }

        .floorplans-modal__spec-icon {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          flex-shrink: 0;
          background: color-mix(in srgb, var(--cor-realce) 18%, transparent);
          color: var(--cor-realce);
        }

        .floorplans-modal__specs small {
          display: block;
          margin-bottom: 0.15rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--cor-texto-apoio);
        }

        .floorplans-modal__specs strong {
          display: block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 1.02rem;
          font-weight: 800;
          color: var(--cor-texto);
        }

        .floorplans-modal__tabs {
          display: grid;
          gap: 0.4rem;
          margin-top: auto;
        }

        .floorplans-modal__tab {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          min-height: 40px;
          padding: 0.45rem 0.75rem;
          border: 1px solid color-mix(in srgb, var(--cor-borda) 55%, transparent);
          border-radius: 10px;
          background: transparent;
          color: var(--cor-texto);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }

        .floorplans-modal__tab-index {
          color: var(--cor-texto-apoio);
          font-size: 0.72rem;
          font-weight: 700;
        }

        .floorplans-modal__tab.is-active {
          border-color: transparent;
          background-image: var(--gradiente-botao);
          background-size: 240% 100%;
          animation: 9s infinite flow-shift-x;
          color: var(--cor-texto);
        }

        .floorplans-modal__tab.is-active .floorplans-modal__tab-index {
          color: var(--cor-texto);
        }

        .floorplans-modal__cta {
          align-self: stretch;
          text-align: center;
        }

        .floorplans-modal__close,
        .floorplans-modal__nav {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 999px;
          cursor: pointer;
        }

        .floorplans-modal__close {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          z-index: 2;
          background: var(--cor-superficie);
          color: var(--cor-texto);
        }

        .floorplans-modal__nav {
          position: absolute;
          top: 50%;
          z-index: 1;
          transform: translateY(-50%);
          background: #161724;
          color: white;
          box-shadow: 0 8px 18px color-mix(in srgb, black 22%, transparent);
        }

        .floorplans-modal__nav--prev { left: 0.85rem; }
        .floorplans-modal__nav--next { right: 0.85rem; }

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

          .floorplans-modal {
            overflow: auto;
          }

          .floorplans-modal__shell {
            grid-template-columns: 1fr;
            max-height: none;
          }

          .floorplans-modal__stage {
            min-height: 240px;
            padding: 1.25rem 3.25rem;
          }

          .floorplans-modal__panel {
            padding: 1.25rem 1.15rem 1.35rem;
          }

          .floorplans-modal__close {
            background: white;
            color: #161724;
          }
        }
      `}</style>
    </section>
  );
}
