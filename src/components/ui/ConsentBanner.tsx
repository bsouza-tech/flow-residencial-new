import { useEffect, useId, useRef, useState } from 'react';
import { PRIVACY_POLICY_URL } from '../../data/site';

type ConsentStatus = 'granted' | 'denied' | null;

function getConsent(): ConsentStatus {
  if (typeof window === 'undefined' || !window.GenesisConsent) return null;
  return window.GenesisConsent.get();
}

export default function ConsentBanner() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [dismissedThisVisit, setDismissedThisVisit] = useState(false);

  useEffect(() => {
    if (!window.GenesisConsent) return;

    const sync = (status: ConsentStatus) => {
      if (status === null) {
        setDismissedThisVisit(false);
        setExiting(false);
        setVisible(true);
        return;
      }
      setVisible(false);
      setExiting(false);
    };

    sync(getConsent());
    return window.GenesisConsent.onChange(sync);
  }, []);

  useEffect(() => {
    if (!visible || exiting || dismissedThisVisit) return;
    acceptRef.current?.focus();
  }, [visible, exiting, dismissedThisVisit]);

  useEffect(() => {
    if (!visible || exiting || dismissedThisVisit) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setDismissedThisVisit(true);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, exiting, dismissedThisVisit]);

  const decideWithTransition = (action: () => void) => {
    setExiting(true);
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
    window.setTimeout(action, delay);
  };

  const handleAccept = () => {
    decideWithTransition(() => window.GenesisConsent?.grant());
  };

  const handleDeny = () => {
    decideWithTransition(() => window.GenesisConsent?.deny());
  };

  if (!visible || dismissedThisVisit) return null;

  return (
    <div className={`consent-banner${exiting ? ' is-exiting' : ''}`} aria-live="polite">
      <div
        ref={dialogRef}
        className="consent-banner__card"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-label="Preferências de cookies"
      >
        <div className="consent-banner__copy">
          <p id={titleId} className="consent-banner__title">
            Cookies e privacidade
          </p>
          <p className="consent-banner__text">
            Usamos cookies e tecnologias similares para medir acessos e melhorar nossos anúncios. Você
            pode aceitar ou recusar. Saiba mais na{' '}
            <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
        <div className="consent-banner__actions">
          <button ref={acceptRef} type="button" className="consent-banner__btn" onClick={handleAccept}>
            Aceitar
          </button>
          <button type="button" className="consent-banner__btn" onClick={handleDeny}>
            Recusar
          </button>
        </div>
      </div>

      <style>{`
        .consent-banner {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10050;
          padding: 0.85rem;
          pointer-events: none;
          animation: consentBannerIn 0.28s ease;
        }

        .consent-banner.is-exiting {
          animation: consentBannerOut 0.22s ease forwards;
        }

        .consent-banner__card {
          pointer-events: auto;
          width: min(100%, 40rem);
          margin-inline: auto;
          display: grid;
          gap: 1rem;
          padding: 1.15rem 1.2rem;
          border: 1.5px solid var(--cor-superficie);
          border-radius: 18px;
          background: var(--cor-fundo);
          box-shadow: 0 28px 64px color-mix(in srgb, var(--cor-fundo-profundo) 28%, transparent);
          color: var(--cor-texto);
        }

        .consent-banner__title {
          margin: 0 0 0.4rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--cor-texto);
        }

        .consent-banner__text {
          margin: 0;
          font-family: 'Open Sans Variable', 'Open Sans Fallback', 'Open Sans', Arial, sans-serif;
          font-size: 0.84rem;
          line-height: 1.55;
          color: var(--cor-texto-apoio);
        }

        .consent-banner__text a {
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .consent-banner__actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.65rem;
        }

        .consent-banner__btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0.8rem 1.25rem;
          border: 0;
          border-radius: var(--raio-botao);
          background-image: var(--gradiente-botao);
          background-size: 240% 100%;
          animation: 9s infinite flow-shift-x;
          box-shadow: var(--sombra-botao);
          color: var(--cor-texto);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .consent-banner__btn:hover {
          filter: brightness(1.05);
          transform: translateY(-0.25rem);
        }

        @keyframes consentBannerIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes consentBannerOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(12px);
          }
        }

        @media (min-width: 640px) {
          .consent-banner {
            padding: 1.25rem;
          }

          .consent-banner__card {
            padding: 1.35rem 1.5rem;
            gap: 1.15rem;
            grid-template-columns: 1fr auto;
            align-items: center;
          }

          .consent-banner__actions {
            min-width: 15.5rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .consent-banner,
          .consent-banner.is-exiting {
            animation: none;
          }

          .consent-banner__btn {
            transition: none;
          }

          .consent-banner__btn:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
