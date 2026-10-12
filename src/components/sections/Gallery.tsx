import { useEffect, useRef, useState } from 'react';
import { animateSectionIntro } from '../../lib/animateIntro';
import { revealBlock, revealMedia } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import { galleryImages } from '../../data/gallery';
import ImageLightbox from '../ui/ImageLightbox';
import Picture from '../ui/Picture';
import { optimizedImages } from '../../data/optimizedImages';


const MAIN_INTERVAL_MS = 4200;
const TRACK_DURATION_S = 40;
/** Repete o set até o trilho ficar largo o bastante para o loop não “acabar”. */
const MARQUEE_FILL = 4;

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [marqueePlaying, setMarqueePlaying] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const images = galleryImages;
  const current = images[activeIndex] ?? images[0];
  const marqueeSet = Array.from({ length: MARQUEE_FILL }, () => images).flat();

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useSectionMotion(
    sectionRef,
    () => {
      animateSectionIntro(sectionRef.current?.querySelector('.gallery__intro'));
      revealMedia(sectionRef.current?.querySelector('.gallery__hero'), {
        trigger: sectionRef.current?.querySelector('.gallery__stage'),
        radius: 16,
        delay: 0.08,
      });
      revealBlock(sectionRef.current?.querySelector('.gallery__rail'), {
        trigger: sectionRef.current?.querySelector('.gallery__stage'),
        delay: 0.22,
        y: 36,
      });
    },
    [reduceMotion]
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        setMarqueePlaying(entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: '80px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || lightboxIndex !== null || images.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % images.length);
    }, MAIN_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [images.length, lightboxIndex, reduceMotion]);

  const openLightbox = (index: number) => {
    setActiveIndex(index);
    setLightboxIndex(index);
  };
  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () =>
    setLightboxIndex((i) => {
      if (i === null) return 0;
      const next = (i + 1) % images.length;
      setActiveIndex(next);
      return next;
    });
  const prevLightbox = () =>
    setLightboxIndex((i) => {
      if (i === null) return 0;
      const prev = (i - 1 + images.length) % images.length;
      setActiveIndex(prev);
      return prev;
    });

  return (
    <section
      ref={sectionRef}
      id="galeria"
      aria-labelledby="gallery-heading"
      className="section-padding gallery"
    >
      <div className="container">
        <div className="gallery-heading gallery__intro">
          <span className="eyebrow" data-reveal="eyebrow">Galeria</span>
          <h2 id="gallery-heading" data-reveal="heading">Veja como é viver no Bellavista.</h2>
          <p data-reveal="text">
            Ambientes pensados para o dia a dia, conforto, luz natural e espaços que convidam a ficar.
          </p>
        </div>

        <div className="gallery__stage">
          <p className="gallery__section-title">Áreas internas</p>

          {current && (
            <button
              type="button"
              className="gallery__hero"
              data-reveal="media"
              onClick={() => openLightbox(activeIndex)}
              aria-label={`Ampliar: ${current.label}`}
            >
              {images.map((image, index) => (
                <Picture
                  key={image.id}
                  name={image.name}
                  alt={image.alt}
                  sizes="(max-width: 959px) 100vw, min(1100px, 92vw)"
                  pictureClassName={`gallery__hero-picture${index === activeIndex ? ' is-active' : ''}`}
                  className="gallery__hero-image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'low'}
                />
              ))}



              <div className="gallery__badge">
                <span>Áreas internas</span>
                <strong>{current.label}</strong>
              </div>

              <div className="gallery__counter">
                {String(activeIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
              </div>
            </button>
          )}

          <div className="gallery__rail" data-reveal="block" aria-label="Miniaturas da galeria">
            <div
              className={`gallery__track${reduceMotion ? ' is-static' : ''}${marqueePlaying ? '' : ' is-paused'}`}
              style={{ animationDuration: `${TRACK_DURATION_S * MARQUEE_FILL}s` }}
            >
              {[0, 1].map((copy) => (
                <div
                  key={`marquee-${copy}`}
                  className="gallery__group"
                  aria-hidden={copy === 1 ? true : undefined}
                >
                  {marqueeSet.map((image, index) => {
                    const realIndex = index % images.length;
                    const active = copy === 0 && realIndex === activeIndex && index < images.length;
                    return (
                      <button
                        key={`${copy}-${image.id}-${index}`}
                        type="button"
                        className={`gallery__thumb${active ? ' is-active' : ''}`}
                        onClick={() => openLightbox(realIndex)}
                        aria-label={copy === 0 ? `Ver ${image.label}` : undefined}
                        tabIndex={copy === 0 && index < images.length ? 0 : -1}
                      >
                        <Picture
                          name={image.name}
                          alt=""
                          sizes="140px"
                          width={optimizedImages[image.name].width}
                          height={optimizedImages[image.name].height}
                          loading="lazy"
                          className="gallery__thumb-img"
                        />

                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={images}
        currentIndex={lightboxIndex}
        onClose={closeLightbox}
        onNext={nextLightbox}
        onPrev={prevLightbox}
        onSelect={openLightbox}
      />

      <style>{`
        .gallery {
          background: #ffffff;
          padding-bottom: clamp(3rem, 5vw, 5rem);
        }

        .gallery__intro {
          margin: 0 auto clamp(2rem, 4vw, 3rem);
          text-align: center;
          max-width: 40rem;
        }

        .gallery__intro .eyebrow {
          color: #19808c;
          display: block;
          margin-bottom: 1rem;
        }

        .gallery__intro h2 {
          margin: 0 auto;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.75rem, 3.5vw, 3rem);
          color: #013034;
          line-height: 1.15;
          max-width: 18ch;
        }

        .gallery__intro p {
          margin: 1rem auto 0;
          max-width: 42ch;
          font-size: 1rem;
          color: #4a5a61;
          line-height: 1.7;
        }

        .gallery__section-title {
          margin: 0 0 1rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #013034;
        }

        .gallery__hero {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 16 / 10;
          border: 0;
          padding: 0;
          border-radius: 18px;
          overflow: hidden;
          background: #e8e4d8;
          cursor: zoom-in;
        }

        .gallery__hero-picture {
          position: absolute;
          inset: 0;
          display: block;
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: scale(1.03);
          transition: opacity 1.1s ease;
          backface-visibility: hidden;
        }

        .gallery__hero-picture.is-active {
          opacity: 1;
          z-index: 1;
          animation: galleryKenBurns 4.2s ease forwards;
        }

        .gallery__hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .gallery__thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }


        @keyframes galleryKenBurns {
          from { transform: scale(1.03); }
          to { transform: scale(1); }
        }

        .gallery__badge {
          position: absolute;
          left: 1rem;
          bottom: 1rem;
          z-index: 2;
          min-width: 11rem;
          padding: 0.75rem 0.95rem 0.85rem;
          background: #ffffff;
          border-top: 3px solid #eb9c36;
          text-align: left;
          box-shadow: 0 8px 24px rgba(1, 48, 52, 0.12);
        }

        .gallery__badge span {
          display: block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #19808c;
          margin-bottom: 0.25rem;
        }

        .gallery__badge strong {
          display: block;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.95rem;
          font-weight: 800;
          color: #013034;
        }

        .gallery__counter {
          position: absolute;
          right: 1rem;
          bottom: 1rem;
          z-index: 2;
          min-height: 36px;
          padding: 0.45rem 0.8rem;
          border-radius: 8px;
          background: #19808c;
          color: #ffffff;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .gallery__rail {
          margin-top: 1rem;
          overflow: hidden;
          mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
        }

        .gallery__track {
          display: flex;
          width: max-content;
          animation-name: galleryMarquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .gallery__track.is-paused {
          animation-play-state: paused;
        }

        .gallery__track.is-static {
          animation: none;
          flex-wrap: wrap;
          width: 100%;
          gap: 0.75rem;
        }

        .gallery__track.is-static .gallery__group:last-child {
          display: none;
        }

        .gallery__group {
          display: flex;
          flex-shrink: 0;
          gap: 0.75rem;
          padding-right: 0.75rem;
        }

        .gallery__thumb {
          flex: 0 0 auto;
          width: clamp(7.5rem, 14vw, 10.5rem);
          aspect-ratio: 4 / 3;
          border: 2px solid transparent;
          border-radius: 12px;
          overflow: hidden;
          padding: 0;
          background: #e8e4d8;
          cursor: zoom-in;
          pointer-events: auto;
          position: relative;
          z-index: 1;
          transition: border-color 0.2s ease;
        }

        .gallery__thumb.is-active {
          border-color: #1c92a0;
        }

        .gallery__thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }

        @keyframes galleryMarquee {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }

        @media (min-width: 768px) {
          .gallery__hero {
            border-radius: 22px;
            aspect-ratio: 21 / 10;
          }

          .gallery__badge {
            left: 1.35rem;
            bottom: 1.35rem;
          }

          .gallery__counter {
            right: 1.35rem;
            bottom: 1.35rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gallery__intro {
            opacity: 1;
          }

          .gallery__track {
            animation: none;
            flex-wrap: wrap;
            width: 100%;
            gap: 0.75rem;
          }

          .gallery__group {
            flex-wrap: wrap;
            padding-right: 0;
          }

          .gallery__group:last-child {
            display: none;
          }

          .gallery__hero-picture,
          .gallery__hero-picture.is-active {
            transition: opacity 0.3s ease;
            animation: none;
            transform: none;
          }

        }
      `}</style>
    </section>
  );
}
