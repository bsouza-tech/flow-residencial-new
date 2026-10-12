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
          <h2 id="location-heading" data-reveal="heading">Perto do que faz parte da sua rotina.</h2>
          <p data-reveal="text">
            O Solar Bellavista está situado em Meudon, Teresópolis, uma localização privilegiada que combina tranquilidade, contato com a natureza e fácil acesso à cidade.
          </p>
        </div>

        <div className="location__layout">
          <div className="location__map-wrap" data-reveal="media">
            <LocationMap activeId={activeId} onSelect={handleSelect} />
          </div>

          <aside className="location__pois-panel">
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

            <address className="location__address" data-reveal="block">
              <strong>{projectLocation.name}</strong>
              {projectLocation.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </aside>
        </div>
      </div>

      <style>{`
        .location {
          background: #ffffff;
        }

        .location__intro {
          margin: 0 auto clamp(2.5rem, 5vw, 4rem);
          max-width: 640px;
          text-align: center;
        }

        .location__intro .eyebrow {
          color: #19808c;
          display: block;
          margin-bottom: 1rem;
        }

        .location__intro h2 {
          margin: 0 auto 1rem;
          max-width: 18ch;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 3.5vw, 3rem);
          color: #013034;
          line-height: 1.15;
        }

        .location__intro p {
          margin: 0 auto;
          max-width: 42ch;
          font-size: 1rem;
          color: #4a5a61;
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
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e4d7b6;
          background: #e8ebe4;
          aspect-ratio: 4 / 3;
          min-height: 320px;
        }

        .location-map__canvas {
          width: 100%;
          height: 100%;
        }

        .location-map .leaflet-container {
          width: 100%;
          height: 100%;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          background: #e8ebe4;
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
          border-radius: 999px;
          background: #013034;
          color: #ffffff;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.82rem;
          font-weight: 700;
          box-shadow: 0 10px 28px rgba(1, 48, 52, 0.28);
          white-space: nowrap;
        }

        .location-map__activate:hover span {
          background: #1c92a0;
        }

        .location-map__lock {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          z-index: 500;
          border: 0;
          border-radius: 999px;
          padding: 0.45rem 0.85rem;
          background: rgba(255, 255, 255, 0.92);
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(1, 48, 52, 0.12);
        }

        .location-pin {
          background: transparent;
          border: 0;
        }

        .location-pin__body {
          display: flex;
          flex-direction: column;
          align-items: center;
          filter: drop-shadow(0 6px 12px rgba(1, 48, 52, 0.28));
        }

        .location-pin__bubble {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: #1c92a0;
          display: grid;
          place-items: center;
          border: 2px solid #ffffff;
        }

        .location-pin__body.is-home .location-pin__bubble {
          width: 40px;
          height: 40px;
          background: #013034;
        }

        .location-pin__point {
          width: 10px;
          height: 10px;
          margin-top: -3px;
          background: #1c92a0;
          transform: rotate(45deg);
          border-radius: 0 0 2px 0;
        }

        .location-pin__body.is-home .location-pin__point {
          background: #013034;
        }

        .location-tip-popup {
          margin-bottom: 6px;
        }

        .location-tip-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 14px;
          background: #ffffff;
          color: #013034;
          border: 1px solid rgba(1, 48, 52, 0.08);
          box-shadow:
            0 18px 40px rgba(1, 48, 52, 0.16),
            0 2px 6px rgba(1, 48, 52, 0.06);
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
          background: #ffffff;
          border: 1px solid rgba(1, 48, 52, 0.08);
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
          background: rgba(28, 146, 160, 0.12);
          color: #1c92a0;
          display: grid;
          place-items: center;
        }

        .location-tip__icon svg {
          display: block;
          stroke: #1c92a0;
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
          color: #013034;
          line-height: 1.25;
          letter-spacing: -0.01em;
        }

        .location-tip__meta {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 0.16rem 0.55rem;
          border-radius: 999px;
          background: rgba(28, 146, 160, 0.12);
          color: #1c92a0;
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
          background: #f7f5ef;
          border: 1px solid rgba(1, 48, 52, 0.06);
          font-size: 0.88rem;
          color: #4a5a61;
          line-height: 1.5;
        }

        .location__address strong {
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          color: #013034;
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
          color: #013034;
        }

        .location__pois-head p {
          margin: 0;
          font-size: 0.82rem;
          color: #5b7a7b;
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
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          min-height: 72px;
          text-align: left;
          padding: 0.85rem 0.9rem;
          border: 1px solid rgba(1, 48, 52, 0.08);
          border-radius: 12px;
          background: #ffffff;
          box-shadow: 0 1px 0 rgba(1, 48, 52, 0.04);
          cursor: pointer;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .location__poi-card:hover {
          border-color: rgba(28, 146, 160, 0.28);
          box-shadow: 0 8px 20px rgba(28, 146, 160, 0.1);
        }

        .location__poi-card.is-active {
          border-color: #1c92a0;
          background: #ffffff;
          box-shadow: 0 10px 24px rgba(28, 146, 160, 0.14);
        }

        .location__poi-icon {
          flex: 0 0 auto;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(28, 146, 160, 0.12);
          color: #1c92a0;
          display: grid;
          place-items: center;
        }

        .location__poi-card.is-active .location__poi-icon {
          background: #1c92a0;
          color: #ffffff;
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
          color: #013034;
          line-height: 1.25;
        }

        .location__poi-distance {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          min-height: 1.45rem;
          padding: 0.12rem 0.58rem;
          border-radius: 999px;
          background: rgba(28, 146, 160, 0.12);
          color: #177681;
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
            aspect-ratio: auto;
            height: 100%;
            min-height: 0;
          }

          .location__map-wrap,
          .location__pois-panel {
            height: 100%;
          }

          .location__pois {
            align-content: start;
          }

          .location__address {
            margin-top: auto;
          }
        }
      `}</style>
    </section>
  );
}
