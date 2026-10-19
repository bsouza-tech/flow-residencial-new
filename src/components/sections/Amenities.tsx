import { useRef, useState } from 'react';
import { animateSectionIntro } from '../../lib/animateIntro';
import { revealItems } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import { amenities, type AmenityImage } from '../../data/amenities';
import ImageLightbox from '../ui/ImageLightbox';
import Picture from '../ui/Picture';


export default function Amenities() {
  const sectionRef = useRef<HTMLElement>(null);
  const [lightboxImages, setLightboxImages] = useState<AmenityImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useSectionMotion(sectionRef, () => {
    animateSectionIntro(sectionRef.current?.querySelector('.amenities__intro'));
    revealItems(sectionRef.current?.querySelectorAll('.amenities__card'), {
      trigger: sectionRef.current?.querySelector('.amenities__grid'),
      stagger: 0.1,
      y: 56,
      scale: 0.95,
      duration: 0.85,
    });
  });

  const openAmenity = (images: AmenityImage[]) => {
    setLightboxImages(images);
    setLightboxIndex(0);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setLightboxImages([]);
  };

  const nextLightbox = () =>
    setLightboxIndex((i) => {
      if (i === null || lightboxImages.length === 0) return 0;
      return (i + 1) % lightboxImages.length;
    });

  const prevLightbox = () =>
    setLightboxIndex((i) => {
      if (i === null || lightboxImages.length === 0) return 0;
      return (i - 1 + lightboxImages.length) % lightboxImages.length;
    });

  return (
    <section
      ref={sectionRef}
      id="benfeitorias"
      aria-labelledby="amenities-heading"
      className="section-padding amenities"
    >
      <div className="container">
        <div className="amenities__intro">
          <span className="eyebrow" data-reveal="eyebrow">Lazer</span>
          <h2 id="amenities-heading" data-reveal="heading">Seu condomínio com lazer e infraestrutura</h2>
        </div>

        <div className="amenities__grid">
          {amenities.map((amenity) => {
            const cover = amenity.images[0];
            const extra = amenity.images.length - 1;
            return (
              <button
                key={amenity.id}
                type="button"
                className="amenities__card"
                data-reveal="items"
                onClick={() => openAmenity(amenity.images)}
                aria-label={
                  extra > 0
                    ? `Ver fotos de ${amenity.title} (${amenity.images.length} imagens)`
                    : `Ver foto de ${amenity.title}`
                }
              >
                <div className="amenities__media">
                  <Picture
                    name={cover.name}
                    alt={cover.alt}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                    loading="lazy"
                    className="amenities__img"
                  />
                  {extra > 0 && (
                    <span className="amenities__badge" aria-hidden="true">
                      +{extra}
                    </span>
                  )}
                </div>

                <span className="amenities__label">{amenity.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={nextLightbox}
        onPrev={prevLightbox}
        onSelect={setLightboxIndex}
      />

      <style>{`
        .amenities {
          background: var(--cor-fundo);
        }

        .amenities__intro {
          margin: 0 auto clamp(2rem, 4vw, 3rem);
          max-width: 40rem;
          text-align: center;
        }

        .amenities__intro .eyebrow {
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
          display: block;
          margin-bottom: 1rem;
        }

        .amenities__intro h2 {
          margin: 0 auto 0.85rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.55rem, 3.2vw, 2.35rem);
          letter-spacing: -0.02em;
          text-transform: none;
          color: var(--cor-texto);
          line-height: 1.15;
        }

        .amenities__intro p {
          margin: 0 auto;
          max-width: 42ch;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: clamp(0.95rem, 1.5vw, 1.05rem);
          line-height: 1.55;
          color: var(--cor-texto-apoio);
        }

        .amenities__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.15rem;
        }

        .amenities__card {
          display: flex;
          flex-direction: column;
          padding: 0;
          border: 0;
          border-radius: 16px;
          overflow: hidden;
          background: var(--cor-superficie);
          cursor: pointer;
          text-align: left;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .amenities__card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 28px color-mix(in srgb, var(--cor-fundo-profundo) 12%, transparent);
        }

        .amenities__card:focus-visible {
          outline: 3px solid var(--cor-realce);
          outline-offset: 3px;
        }

        .amenities__media {
          position: relative;
          aspect-ratio: 16 / 11;
          overflow: hidden;
          background: var(--cor-superficie);
        }

        .amenities__media picture {
          display: block;
          width: 100%;
          height: 100%;
        }

        .amenities__media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s ease;
        }

        .amenities__card:hover .amenities__media img {
          transform: scale(1.04);
        }

        .amenities__badge {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          width: 2.15rem;
          height: 2.15rem;
          border-radius: 999px;
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: 11s infinite flow-shift-x;
          color: var(--cor-fundo-profundo);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.78rem;
          display: grid;
          place-items: center;
          box-shadow: 0 4px 12px color-mix(in srgb, var(--cor-fundo-profundo) 18%, transparent);
        }

        .amenities__label {
          display: block;
          padding: 1rem 1.15rem 1.1rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.92rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--cor-texto);
          background: var(--cor-superficie);
        }

        @media (min-width: 640px) {
          .amenities__grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }

          .amenities__card:last-child {
            grid-column: 1 / -1;
          }
        }

        @media (min-width: 960px) {
          .amenities__grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
          }

          .amenities__card:last-child {
            grid-column: auto;
          }

          .amenities__label {
            padding: 1rem 1.1rem 1.05rem;
            font-size: 0.88rem;
          }
        }
      `}</style>
    </section>
  );
}
