import { useEffect, useRef } from 'react';

export interface LightboxImage {
  id: string;
  src: string;
  alt: string;
  label: string;
}

interface Props {
  images: LightboxImage[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelect?: (index: number) => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
  onSelect,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = currentIndex !== null;
  const image = currentIndex !== null ? images[currentIndex] : null;
  const hasMultiple = images.length > 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    } else if (dialog.open) {
      dialog.close();
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onNext, onPrev, onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', onCancel);
    return () => dialog.removeEventListener('cancel', onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={image ? `Imagem: ${image.label}` : 'Galeria de imagens'}
      aria-modal="true"
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="image-lightbox"
    >
      {image && currentIndex !== null && (
        <div className="image-lightbox__stage">
          <header className="image-lightbox__top">
            <div className="image-lightbox__meta">
              <p className="image-lightbox__label">{image.label}</p>
              {hasMultiple && (
                <p className="image-lightbox__counter">
                  {currentIndex + 1} <span>/</span> {images.length}
                </p>
              )}
            </div>

            <button
              type="button"
              className="image-lightbox__close"
              onClick={onClose}
              aria-label="Fechar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </header>

          <div className="image-lightbox__viewport">
            {hasMultiple && (
              <button
                type="button"
                className="image-lightbox__nav image-lightbox__nav--prev"
                onClick={onPrev}
                aria-label="Imagem anterior"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}

            <figure className="image-lightbox__figure">
              <img
                key={image.id}
                src={image.src}
                alt={image.alt}
                className="image-lightbox__image"
                width={1200}
                height={900}
                loading="eager"
                decoding="async"
              />

            </figure>

            {hasMultiple && (
              <button
                type="button"
                className="image-lightbox__nav image-lightbox__nav--next"
                onClick={onNext}
                aria-label="Próxima imagem"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
          </div>

          {hasMultiple && (
            <div className="image-lightbox__thumbs" role="navigation" aria-label="Miniaturas">
              {images.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`image-lightbox__thumb${index === currentIndex ? ' is-active' : ''}`}
                  onClick={() => onSelect?.(index)}
                  aria-label={`Ver ${item.label}`}
                  aria-current={index === currentIndex ? 'true' : undefined}
                >
                  <img src={item.src} alt="" loading="lazy" decoding="async" width={160} height={120} />

                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .image-lightbox {
          border: none;
          padding: 0;
          margin: 0;
          max-width: 100vw;
          max-height: 100dvh;
          width: 100vw;
          height: 100dvh;
          background: color-mix(in srgb, var(--cor-fundo-profundo) 92%, transparent);
          backdrop-filter: blur(18px);
          color: var(--cor-texto);
        }

        .image-lightbox:not([open]) {
          display: none;
        }

        .image-lightbox[open] {
          display: grid;
        }

        .image-lightbox::backdrop {
          background: color-mix(in srgb, var(--cor-fundo-profundo) 70%, transparent);
        }

        .image-lightbox__stage {
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
          width: 100%;
          height: 100%;
          min-height: 0;
          padding:
            max(0.85rem, env(safe-area-inset-top))
            max(0.85rem, env(safe-area-inset-right))
            max(0.85rem, env(safe-area-inset-bottom))
            max(0.85rem, env(safe-area-inset-left));
          box-sizing: border-box;
        }

        .image-lightbox__top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.25rem 0.35rem 0.85rem;
        }

        .image-lightbox__meta {
          display: flex;
          align-items: baseline;
          gap: 0.85rem;
          min-width: 0;
        }

        .image-lightbox__label {
          margin: 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: clamp(0.95rem, 1.6vw, 1.15rem);
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--cor-texto);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .image-lightbox__counter {
          margin: 0;
          flex-shrink: 0;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: color-mix(in srgb, var(--cor-texto) 55%, transparent);
        }

        .image-lightbox__counter span {
          margin: 0 0.15rem;
          color: color-mix(in srgb, var(--cor-texto) 35%, transparent);
        }

        .image-lightbox__close {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: var(--raio-botao);
          background: color-mix(in srgb, var(--cor-texto) 10%, transparent);
          color: var(--cor-texto);
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .image-lightbox__close:hover {
          background: color-mix(in srgb, var(--cor-texto) 18%, transparent);
        }

        .image-lightbox__close:active {
          transform: scale(0.96);
        }

        .image-lightbox__viewport {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 0;
          padding: 0 3.5rem;
        }

        .image-lightbox__figure {
          margin: 0;
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
          min-height: 0;
        }

        .image-lightbox__image {
          display: block;
          width: auto;
          height: auto;
          max-width: min(88vw, 960px);
          max-height: 72dvh;
          object-fit: contain;
          border-radius: 10px;
          box-shadow: 0 24px 64px color-mix(in srgb, var(--cor-fundo-profundo) 35%, transparent);
          animation: lightbox-fade 0.28s ease;
        }

        @keyframes lightbox-fade {
          from {
            opacity: 0;
            transform: scale(0.985);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .image-lightbox__nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          width: 52px;
          height: 52px;
          border: 0;
          border-radius: var(--raio-botao);
          background: color-mix(in srgb, var(--cor-texto) 12%, transparent);
          color: var(--cor-texto);
          cursor: pointer;
          display: grid;
          place-items: center;
          backdrop-filter: blur(8px);
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .image-lightbox__nav:hover {
          background: color-mix(in srgb, var(--cor-texto) 22%, transparent);
        }

        .image-lightbox__nav:active {
          transform: translateY(-50%) scale(0.96);
        }

        .image-lightbox__nav--prev {
          left: 0.15rem;
        }

        .image-lightbox__nav--next {
          right: 0.15rem;
        }

        .image-lightbox__thumbs {
          display: flex;
          justify-content: center;
          gap: 0.55rem;
          overflow-x: auto;
          padding: 1rem 0.25rem 0.35rem;
          scrollbar-width: none;
        }

        .image-lightbox__thumbs::-webkit-scrollbar {
          display: none;
        }

        .image-lightbox__thumb {
          flex: 0 0 auto;
          width: 76px;
          aspect-ratio: 4 / 3;
          padding: 0;
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          background: color-mix(in srgb, var(--cor-texto) 8%, transparent);
          cursor: pointer;
          opacity: 0.55;
          transition: opacity 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .image-lightbox__thumb:hover {
          opacity: 0.85;
        }

        .image-lightbox__thumb.is-active {
          opacity: 1;
          border-color: var(--cor-realce);
          transform: translateY(-2px);
        }

        .image-lightbox__thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 768px) {
          .image-lightbox__stage {
            padding:
              max(0.65rem, env(safe-area-inset-top))
              max(0.65rem, env(safe-area-inset-right))
              max(0.75rem, env(safe-area-inset-bottom))
              max(0.65rem, env(safe-area-inset-left));
          }

          .image-lightbox__viewport {
            padding: 0;
          }

          .image-lightbox__image {
            max-width: 100%;
            max-height: 68dvh;
            border-radius: 6px;
          }

          .image-lightbox__nav {
            width: 42px;
            height: 42px;
            background: color-mix(in srgb, var(--cor-fundo-profundo) 55%, transparent);
          }

          .image-lightbox__nav--prev {
            left: 0.35rem;
          }

          .image-lightbox__nav--next {
            right: 0.35rem;
          }

          .image-lightbox__thumb {
            width: 64px;
          }

          .image-lightbox__label {
            font-size: 0.95rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .image-lightbox__image {
            animation: none;
          }

          .image-lightbox__thumb,
          .image-lightbox__nav,
          .image-lightbox__close {
            transition: none;
          }
        }
      `}</style>
    </dialog>
  );
}
