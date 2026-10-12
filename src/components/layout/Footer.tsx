import { useRef } from 'react';
import { PRIVACY_POLICY_URL } from '../../data/site';
import { revealItems } from '../../lib/animateReveal';
import { useSectionMotion } from '../../lib/useSectionMotion';
import Picture from '../ui/Picture';


const footerLinks = [
  { label: 'Início', href: '#hero' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Plantas', href: '#plantas' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Lazer', href: '#benfeitorias' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Formulário', href: '#interesse' },
  { label: 'Sobre', href: '#sobre' },
];

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/meuapsolar/',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/MeuApeSolar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1Z" />
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
            <a href="#hero" className="site-footer__logo" aria-label="Gênesis Empreendimentos — início">
              <Picture
                name="genesis-logo"
                alt="Gênesis Empreendimentos"
                sizes="220px"
                width={220}
                height={56}
                loading="lazy"
              />

            </a>
            <p>
              Gênesis Empreendimentos — Construindo sonhos e transformando vidas.
            </p>
            <div className="site-footer__social">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="site-footer__social-btn"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="site-footer__col" data-reveal="items">
            <h3>Navegação</h3>
            <nav aria-label="Navegação do rodapé">
              <ul>
                {footerLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href}>{link.label}</a>
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
        </div>

        <div className="site-footer__bottom" data-reveal="items">
          <p className="site-footer__copy">
            © {year} desenvolvido por{' '}
            <a href="https://genesisempreendimentos.com.br" target="_blank" rel="noopener noreferrer">
              Gênesis Empreendimentos
            </a>
          </p>
          <div className="site-footer__legal-links">
            <a
              className="site-footer__privacy"
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Privacidade
            </a>
            <button
              type="button"
              className="site-footer__privacy site-footer__cookies"
              onClick={() => window.GenesisConsent?.reset()}
            >
              Preferências de cookies
            </button>
          </div>
          <p className="site-footer__legal">
            Todas as imagens são meramente ilustrativas. O projeto arquitetônico, as numerações das unidades, as cores, os detalhes da fachada e as ilustrações artísticas poderão sofrer alterações. Responsável técnico do projeto: Renata Pessôa de Rezende – CAU/RJ A33148-1. A decoração, os equipamentos da varanda, a mobília e o paisagismo são meras sugestões e não fazem parte das obrigações de entrega do imóvel. As unidades entregues e suas características, bem como o padrão de acabamento, estão discriminados no memorial descritivo arquivado no memorial de incorporação devidamente registrado na matrícula 14.706 no Cartório do 1° Ofício - Registro do Imóveis da comarca de Teresópolis - RJ.
          </p>
        </div>
      </div>

      <style>{`
        .site-footer {
          background:
            radial-gradient(ellipse 80% 70% at 15% 0%, rgba(28, 146, 160, 0.22) 0%, transparent 55%),
            linear-gradient(165deg, #024048 0%, #013034 48%, #01262a 100%);
          color: #ffffff;
          padding-block: clamp(3.5rem, 7vw, 5rem) 2.25rem;
        }

        .site-footer__top {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
          padding-bottom: 2.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .site-footer__brand {
          max-width: 22rem;
        }

        .site-footer__logo {
          display: inline-flex;
          margin-bottom: 1.15rem;
        }

        .site-footer__logo picture {
          display: block;
          width: min(100%, 220px);
        }

        .site-footer__logo img {
          display: block;
          width: 100%;
          height: auto;
        }

        .site-footer__brand > p {
          margin: 0 0 1.35rem;
          font-size: 0.9rem;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.68);
        }

        .site-footer__social {
          display: flex;
          gap: 0.65rem;
        }

        .site-footer__social-btn {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .site-footer__social-btn:hover {
          background: rgba(28, 146, 160, 0.35);
          border-color: rgba(28, 146, 160, 0.55);
          transform: translateY(-1px);
        }

        .site-footer__col h3 {
          margin: 0 0 1.1rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #ffd166;
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
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          font-size: 0.9rem;
          line-height: 1.45;
          transition: color 0.2s ease;
        }

        .site-footer__col a:hover {
          color: #ffffff;
        }

        .site-footer__contact li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }

        .site-footer__icon {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          background: rgba(28, 146, 160, 0.18);
          color: #9fd8df;
          margin-top: 0.05rem;
        }

        .site-footer__contact address {
          font-style: normal;
          font-size: 0.9rem;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.72);
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

        .site-footer__copy,
        .site-footer__privacy,
        .site-footer__legal {
          margin: 0;
          color: rgba(255, 255, 255, 0.48);
          font-size: 0.8rem;
          line-height: 1.6;
        }

        .site-footer__cookies {
          appearance: none;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          font: inherit;
        }

        .site-footer__copy a {
          color: #14b8a6;
          text-decoration: none;
          font-weight: 700;
          transition: color 0.2s ease;
        }

        .site-footer__copy a:hover {
          color: #2dd4bf;
        }

        .site-footer__privacy {
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .site-footer__privacy:hover {
          color: #ffffff;
        }

        .site-footer__privacy {
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
        }

        .site-footer__legal {
          max-width: 58rem;
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.38);
          line-height: 1.7;
        }

        @media (min-width: 768px) {
          .site-footer__top {
            grid-template-columns: 1.35fr 0.9fr 1.25fr;
            gap: 2.5rem 3rem;
          }
        }

        @media (min-width: 1024px) {
          .site-footer__top {
            gap: 3rem 4rem;
          }
        }
      `}</style>
    </footer>
  );
}
