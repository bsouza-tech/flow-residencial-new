import { useCallback, useRef, useState } from 'react';
import { animateSectionIntro } from '../../lib/animateIntro';
import { revealBlock, revealItems, revealMedia } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import { nearbyPlaces, projectLocation } from '../../data/pointsOfInterest';
import LocationMap from '../ui/LocationMap';
import { PoiGlyph } from '../ui/PoiIcons';

export default function Location() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(projectLocation.id);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  useSectionMotion(sectionRef, () => {
    animateSectionIntro(sectionRef.current?.querySelector('.location__intro'));
    revealMedia(sectionRef.current?.querySelector('.location__map-wrap'), {
      trigger: sectionRef.current?.querySelector('.location__layout'),
      radius: 16,
    });
    revealItems(sectionRef.current?.querySelectorAll('.location__poi-card'), {
      trigger: sectionRef.current?.querySelector('.location__pois'),
      stagger: 0.08,
      y: 32,
      scale: 0.97,
      duration: 0.65,
      delay: 0.12,
    });
    revealBlock(sectionRef.current?.querySelector('.location__address'), {
      trigger: sectionRef.current?.querySelector('.location__pois-panel'),
      delay: 0.28,
      y: 24,
    });
  });

  return (
    <section
      ref={sectionRef}
      id="localizacao"
      aria-labelledby="location-heading"
      className="section-padding location"
    >
      <div className="container">
        <div className="location__intro">
          <span className="eyebrow" data-reveal="eyebrow">Localização</span>
          <h2 id="location-heading" data-reveal="heading">Uma localização privilegiada para uma vida prática e conectada</h2>
          <p data-reveal="text">
            Localizado no bairro N. S. de Fátima, em Teresópolis, o Flow oferece fácil acesso a tudo o que você precisa. Um endereço que une mobilidade, comodidade e qualidade de vida no seu dia a dia.
          </p>
        </div>

        <div className="location__layout">
          <div className="location__map-wrap" data-reveal="media">
            <LocationMap activeId={activeId} onSelect={handleSelect} />
          </div>

          <aside className="location__pois-panel">
            <address className="location__address" data-reveal="block">
              <strong>{projectLocation.name}</strong>
              {projectLocation.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>

            {nearbyPlaces.length > 0 && (
              <>
                <header className="location__pois-head">
                  <h3>Pontos de interesse</h3>
                  <p>Selecione para ver no mapa</p>
                </header>

                <ul className="location__pois" role="list" aria-label="Pontos de interesse">
                  {nearbyPlaces.map((place) => {
                    const active = activeId === place.id;
                    return (
                      <li key={place.id}>
                        <button
                          type="button"
                          className={`location__poi-card${active ? ' is-active' : ''}`}
                          data-reveal="items"
                          onClick={() => handleSelect(place.id)}
                          aria-pressed={active}
                        >
                          <span className="location__poi-icon" aria-hidden="true">
                            <PoiGlyph icon={place.icon} />
                          </span>
                          <span className="location__poi-copy">
                            <span className="location__poi-name">{place.name}</span>
                            <span className="location__poi-distance">{place.distance}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        .location {
          background: var(--cor-fundo);
        }

        .location__intro {
          margin: 0 auto clamp(2.5rem, 5vw, 4rem);
          max-width: 640px;
          text-align: center;
        }

        .location__intro .eyebrow {
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
          display: block;
          margin-bottom: 1rem;
        }

        .location__intro h2 {
          margin: 0 auto 1rem;
          max-width: 18ch;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 3.5vw, 3rem);
          color: var(--cor-texto);
          line-height: 1.15;
        }

        .location__intro p {
          margin: 0 auto;
          max-width: 42ch;
          font-size: 1rem;
          color: var(--cor-texto-apoio);
          line-height: 1.7;
        }

        .location__layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .location__map-wrap {
          min-width: 0;
        }

        .location-map {
          position: relative;
          z-index: 0;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--cor-superficie);
          background: var(--cor-superficie);
          aspect-ratio: 4 / 3;
          min-height: 320px;
        }

        .location-map__canvas,
        .location-map .leaflet-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .location-map .leaflet-container {
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          background: #d5dde3;
        }

        .location-map .leaflet-container img,
        .location-map .leaflet-container canvas {
          max-width: none !important;
          max-height: none !important;
        }

        .location-map:not(.is-active) .leaflet-container {
          cursor: default;
        }

        .location-map__activate {
          position: absolute;
          left: 50%;
          bottom: 1rem;
          transform: translateX(-50%);
          z-index: 500;
          border: 0;
          margin: 0;
          padding: 0;
          cursor: pointer;
          background: transparent;
        }

        .location-map:not(.is-active) .leaflet-marker-pane,
        .location-map:not(.is-active) .leaflet-overlay-pane,
        .location-map:not(.is-active) .leaflet-shadow-pane {
          pointer-events: none;
        }

        .location-map__activate span {
          display: inline-flex;
          padding: 0.85rem 1.35rem;
          border-radius: var(--raio-botao);
          background: var(--cor-fundo-profundo);
          color: var(--cor-texto);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          box-shadow: 0 10px 28px color-mix(in srgb, var(--cor-fundo-profundo) 28%, transparent);
          white-space: nowrap;
        }

        .location-map__activate:hover span {
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: 11s infinite flow-shift-x;
          color: var(--cor-fundo-profundo);
        }

        .location-map .leaflet-bar a,
        .location-map .leaflet-bar a:hover {
          background: var(--cor-superficie);
          color: var(--cor-texto);
          border-bottom-color: var(--cor-borda);
        }

        .location-map .leaflet-control-attribution {
          background: color-mix(in srgb, var(--cor-fundo) 88%, transparent);
          color: var(--cor-texto-apoio);
        }

        .location-map__lock {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          z-index: 500;
          border: 0;
          border-radius: var(--raio-botao);
          padding: 0.45rem 0.85rem;
          background: color-mix(in srgb, var(--cor-texto) 92%, transparent);
          color: var(--cor-fundo-profundo);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--cor-fundo-profundo) 12%, transparent);
        }

        .location-pin {
          background: transparent;
          border: 0;
        }

        .location-pin__body {
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 6px 12px color-mix(in srgb, var(--cor-fundo-profundo) 28%, transparent));
        }

        .location-pin__bubble {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: 11s infinite flow-shift-x;
          display: grid;
          place-items: center;
          border: 2px solid var(--cor-fundo-profundo);
        }

        .location-pin__body.is-home .location-pin__bubble {
          width: 40px;
          height: 40px;
          background: var(--cor-fundo-profundo);
        }

        .location-pin__point {
          width: 10px;
          height: 10px;
          margin-top: -3px;
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: 11s infinite flow-shift-x;
          transform: rotate(45deg);
          border-radius: 0 0 2px 0;
        }

        .location-pin__body.is-home .location-pin__point {
          background: var(--cor-fundo-profundo);
        }

        .location-tip-popup {
          margin-bottom: 6px;
        }

        .location-tip-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 14px;
          background: var(--cor-fundo);
          color: var(--cor-texto);
          border: 1px solid color-mix(in srgb, var(--cor-fundo-profundo) 8%, transparent);
          box-shadow:
            0 18px 40px color-mix(in srgb, var(--cor-fundo-profundo) 16%, transparent),
            0 2px 6px color-mix(in srgb, var(--cor-fundo-profundo) 6%, transparent);
          overflow: hidden;
        }

        .location-tip-popup .leaflet-popup-content {
          margin: 0;
          line-height: 1.3;
          width: auto !important;
        }

        .location-tip-popup .leaflet-popup-tip-container {
          margin-top: -1px;
        }

        .location-tip-popup .leaflet-popup-tip {
          background: var(--cor-fundo);
          border: 1px solid color-mix(in srgb, var(--cor-fundo-profundo) 8%, transparent);
          box-shadow: none;
          width: 14px;
          height: 14px;
        }

        .location-tip {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          min-width: 168px;
        }

        .location-tip__icon {
          flex: 0 0 auto;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--cor-realce) 12%, transparent);
          color: var(--cor-realce);
          display: grid;
          place-items: center;
        }

        .location-tip__icon svg {
          display: block;
          stroke: var(--cor-realce);
        }

        .location-tip__copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.35rem;
          min-width: 0;
        }

        .location-tip__title {
          display: block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--cor-texto);
          line-height: 1.25;
          letter-spacing: -0.01em;
        }

        .location-tip__meta {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 0.16rem 0.55rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--cor-realce) 12%, transparent);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }

        .location__address {
          font-style: normal;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin-top: 0.35rem;
          padding: 1.1rem 1.2rem;
          border-radius: 14px;
          background: var(--cor-superficie);
          border: 1px solid color-mix(in srgb, var(--cor-fundo-profundo) 6%, transparent);
          font-size: 0.88rem;
          color: var(--cor-texto-apoio);
          line-height: 1.5;
        }

        .location__address strong {
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          color: var(--cor-texto);
          font-size: 0.92rem;
          margin-bottom: 0.15rem;
        }

        .location__pois-panel {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 0;
        }

        .location__pois-head h3 {
          margin: 0 0 0.25rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: 1rem;
          color: var(--cor-texto);
        }

        .location__pois-head p {
          margin: 0;
          font-size: 0.82rem;
          color: var(--cor-texto-apoio);
        }

        .location__pois {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.65rem;
        }

        .location__pois > li {
          margin: 0;
          padding: 0;
        }

        .location__poi-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.7rem;
          width: 100%;
          min-height: 0;
          text-align: left;
          padding: 1rem;
          border: 1px solid color-mix(in srgb, var(--cor-fundo-profundo) 8%, transparent);
          border-radius: 12px;
          background: var(--cor-fundo);
          box-shadow: 0 1px 0 color-mix(in srgb, var(--cor-fundo-profundo) 4%, transparent);
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .location__poi-card:hover {
          border-color: color-mix(in srgb, var(--cor-realce) 28%, transparent);
          box-shadow: 0 8px 20px color-mix(in srgb, var(--cor-realce) 10%, transparent);
        }

        .location__poi-card.is-active {
          border-color: var(--cor-realce);
          background: var(--cor-fundo);
          box-shadow: 0 10px 24px color-mix(in srgb, var(--cor-realce) 14%, transparent);
        }

        .location__poi-icon {
          flex: 0 0 auto;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: color-mix(in srgb, var(--cor-realce) 12%, transparent);
          color: var(--cor-realce);
          display: grid;
          place-items: center;
        }

        .location__poi-card.is-active .location__poi-icon {
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: 11s infinite flow-shift-x;
          color: var(--cor-fundo-profundo);
        }

        .location__poi-copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.4rem;
          min-width: 0;
        }

        .location__poi-name {
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--cor-texto);
          line-height: 1.25;
        }

        .location__poi-distance {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          min-height: 1.45rem;
          padding: 0.12rem 0.58rem;
          border-radius: 999px;
          background: color-mix(in srgb, var(--cor-realce) 12%, transparent);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
        }

        @media (min-width: 640px) {
          .location__pois {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .location__layout {
            grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.95fr);
            gap: 1.35rem;
            align-items: stretch;
          }

          .location-map {
            aspect-ratio: 4 / 3;
            height: auto;
            min-height: 480px;
          }

          .location__map-wrap,
          .location__pois-panel {
            height: auto;
          }

          .location__pois-panel {
            gap: 0.7rem;
          }

          .location__address {
            margin-top: 0;
            padding: 0.8rem 0.95rem;
            gap: 0.08rem;
            font-size: 0.82rem;
          }

          .location__pois-head h3 {
            margin-bottom: 0.1rem;
            font-size: 0.95rem;
          }

          .location__pois-head p {
            font-size: 0.75rem;
          }

          .location__pois {
            gap: 0.45rem;
            align-content: start;
          }

          .location__poi-card {
            gap: 0.4rem;
            padding: 0.6rem 0.7rem;
            border-radius: 10px;
          }

          .location__poi-icon {
            width: 30px;
            height: 30px;
            border-radius: 8px;
          }

          .location__poi-copy {
            gap: 0.15rem;
          }

          .location__poi-name {
            font-size: 0.78rem;
            line-height: 1.2;
          }

          .location__poi-distance {
            min-height: 0;
            padding: 0;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </section>
  );
}
