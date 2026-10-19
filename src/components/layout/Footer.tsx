import { useRef } from 'react';
import { PRIVACY_POLICY_URL } from '../../data/site';
import { revealItems } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import Picture from '../ui/Picture';


const footerLinks = [
  { label: 'Início', href: '#hero' },
  { label: 'Destaques', href: '#beneficios' },
  { label: 'Plantas', href: '#plantas' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Lazer', href: '#benfeitorias' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Receber condições', href: '#interesse' },
  { label: 'Sobre', href: '#sobre' },
];

const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/genesisempreendimentos',
    tone: 'facebook',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/genesisempreendimentos/',
    tone: 'instagram',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@genesisempreendimentos_',
    tone: 'youtube',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6ZM9.8 15.5v-6.6l6.2 3.3-6.2 3.3Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);

  useSectionMotion(footerRef, () => {
    revealItems(
      footerRef.current?.querySelectorAll('.site-footer__brand, .site-footer__col'),
      {
        trigger: footerRef.current?.querySelector('.site-footer__top'),
        stagger: 0.12,
        y: 36,
        scale: 0.98,
        duration: 0.75,
      }
    );
    revealItems(footerRef.current?.querySelectorAll('.site-footer__bottom'), {
      trigger: footerRef.current,
      y: 20,
      scale: 1,
      duration: 0.55,
      delay: 0.2,
      start: 'top 92%',
    });
  });

  return (
    <footer ref={footerRef} className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div className="site-footer__brand" data-reveal="items">
            <a href="#hero" className="site-footer__logo" aria-label="Flow Residencial — início">
              <Picture
                name="flow-logo"
                alt="Flow Residencial"
                sizes="140px"
                width={140}
                height={48}
                loading="lazy"
              />
            </a>
            <p className="site-footer__tagline">Seu espaço, Seu ritmo, Seu futuro.</p>
            <p className="site-footer__copy">
              © {year} desenvolvido por{' '}
              <a href="https://genesisempreendimentos.com.br" target="_blank" rel="noopener noreferrer">
                Gênesis Empreendimentos
              </a>
            </p>
            <img
              className="site-footer__partners"
              src="/img/genesis-caixa.png"
              alt="Gênesis Empreendimentos e Caixa"
              width={732}
              height={90}
            />
          </div>

          <div className="site-footer__col" data-reveal="items">
            <h3>Sobre o Flow</h3>
            <nav aria-label="Navegação do rodapé">
              <ul>
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      {...(link.href === '#interesse' ? { 'data-abrir-formulario': '' } : {})}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="site-footer__col" data-reveal="items">
            <h3>Contato</h3>
            <ul className="site-footer__contact">
              <li>
                <span className="site-footer__icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <address>
                  Av. Oliveira Botelho, 982 — Alto
                  <br />
                  Teresópolis — RJ, 25960-004
                </address>
              </li>
              <li>
                <span className="site-footer__icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2.1Z" />
                  </svg>
                </span>
                <a href="tel:+552126421203">(21) 2642-1203</a>
              </li>
              <li>
                <span className="site-footer__icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16v16H4z" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </span>
                <a href="mailto:comercial@genesisempreendimentos.com.br">
                  comercial@genesisempreendimentos.com.br
                </a>
              </li>
            </ul>
          </div>

          <div className="site-footer__col" data-reveal="items">
            <h3>Redes Sociais</h3>
            <div className="site-footer__social">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className={`site-footer__social-btn site-footer__social-btn--${item.tone}`}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="site-footer__bottom" data-reveal="items">
          <div className="site-footer__legal-links">
            <a
              className="site-footer__privacy"
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Privacidade
            </a>
            <a
              className="site-footer__privacy"
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preferências de cookies
            </a>
          </div>
          <p className="site-footer__legal">
            Responsável técnico do projeto: Renata Pessôa de Rezende, CAU/RJ A33148-1.
          </p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background: var(--cor-fundo-profundo);
          color: var(--cor-texto);
          padding-block: clamp(3.5rem, 7vw, 5rem) 2.25rem;
        }

        .site-footer__top {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid color-mix(in srgb, var(--cor-texto) 12%, transparent);
        }

        .site-footer__brand {
          max-width: 18rem;
        }

        .site-footer__logo {
          display: inline-flex;
          margin-bottom: 1rem;
        }

        .site-footer__logo picture {
          display: block;
          width: 7.5rem;
        }

        .site-footer__logo img {
          display: block;
          width: 100%;
          height: auto;
        }

        .site-footer__tagline {
          margin: 0 0 1.75rem;
          max-width: 16rem;
          font-size: 0.78rem;
          font-style: italic;
          font-weight: 400;
          line-height: 1.5;
          color: color-mix(in srgb, var(--cor-texto) 82%, transparent);
        }

        .site-footer__partners {
          display: block;
          width: auto;
          max-width: 16rem;
          height: auto;
          margin-top: 0.85rem;
        }

        .site-footer__social {
          display: flex;
          gap: 0.65rem;
        }

        .site-footer__social-btn {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          display: grid;
          place-items: center;
          color: #fff;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .site-footer__social-btn:hover {
          opacity: 0.82;
        }

        .site-footer__social-btn--facebook {
          background: #3b5998;
        }

        .site-footer__social-btn--instagram {
          background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
        }

        .site-footer__social-btn--youtube {
          background: #ff0000;
        }

        .site-footer__col h3 {
          margin: 0 0 1.15rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: none;
          color: var(--cor-texto);
        }

        .site-footer__col ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .site-footer__col a {
          color: color-mix(in srgb, var(--cor-texto) 72%, transparent);
          text-decoration: none;
          font-size: 0.9rem;
          line-height: 1.45;
          transition: color 0.2s ease;
        }

        .site-footer__col a:hover {
          color: var(--cor-texto);
        }

        .site-footer__contact li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .site-footer__icon {
          flex: 0 0 auto;
          width: 16px;
          height: 16px;
          display: grid;
          place-items: center;
          color: var(--cor-realce);
          margin-top: 0.15rem;
        }

        .site-footer__contact address {
          font-style: normal;
          font-size: 0.9rem;
          line-height: 1.55;
          color: color-mix(in srgb, var(--cor-texto) 72%, transparent);
        }

        .site-footer__contact a {
          word-break: break-word;
        }

        .site-footer__bottom {
          padding-top: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }

        .site-footer__legal-links {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.75rem 1.25rem;
        }

        .site-footer__copy {
          margin: 0;
          color: color-mix(in srgb, var(--cor-texto) 42%, transparent);
          font-size: 0.68rem;
          line-height: 1.5;
        }

        .site-footer__privacy,
        .site-footer__legal {
          margin: 0;
          color: color-mix(in srgb, var(--cor-texto) 48%, transparent);
          font-size: 0.8rem;
          line-height: 1.6;
        }

        .site-footer__copy a {
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s ease;
        }

        .site-footer__copy a:hover {
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
        }

        .site-footer__privacy {
          color: color-mix(in srgb, var(--cor-texto) 72%, transparent);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .site-footer__privacy:hover {
          color: var(--cor-texto);
        }

        .site-footer__privacy {
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
        }

        .site-footer__legal {
          max-width: 58rem;
          font-size: 0.72rem;
          color: color-mix(in srgb, var(--cor-texto) 38%, transparent);
          line-height: 1.7;
        }

        @media (min-width: 768px) {
          .site-footer__top {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem 3rem;
          }
        }

        @media (min-width: 1024px) {
          .site-footer__top {
            grid-template-columns: 1.15fr 0.85fr 1.2fr 0.7fr;
            gap: 2.5rem 3rem;
          }
        }
      `}</style>
    </footer>
  );
}
