import { useEffect, useRef, useState } from 'react';

import Picture from '../ui/Picture';


const navLinks = [
  { label: 'Início', href: '#hero' },
  { label: 'Destaques', href: '#beneficios' },
  { label: 'Plantas', href: '#plantas' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Lazer', href: '#benfeitorias' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Receber condições', href: '#interesse' },
  { label: 'Sobre', href: '#sobre' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
      menuRef.current?.querySelector('a')?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !menuOpen) return;
      const widgetAberto = [...document.querySelectorAll('div')].some((node) => {
        const overlay = node.shadowRoot?.querySelector('.overlay');
        return Boolean(overlay && !overlay.hidden);
      });
      if (widgetAberto) return;
      setMenuOpen(false);
      btnRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const scrollToTop = () => {
    history.pushState(null, '', '#hero');
    const start = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const waitClosed = () => {
      const header = document.querySelector('.site-header');
      const closed = !header?.classList.contains('is-open') && document.body.style.overflow !== 'hidden';
      if (closed) {
        requestAnimationFrame(() => requestAnimationFrame(start));
        return;
      }
      requestAnimationFrame(waitClosed);
    };
    requestAnimationFrame(waitClosed);
  };

  const scrollToHash = (href: string) => {
    const start = () => {
      const el = document.querySelector(href);
      const bar = document.querySelector('.site-header__bar');
      if (!(el instanceof HTMLElement) || !(bar instanceof HTMLElement)) return;

      const align = () => {
        const currentBar = document.querySelector('.site-header__bar');
        const scroller = document.scrollingElement;
        if (!(currentBar instanceof HTMLElement) || !scroller) return;
        const root = document.documentElement;
        const previous = root.style.scrollBehavior;
        root.style.scrollBehavior = 'auto';
        const top = el.getBoundingClientRect().top + window.scrollY - currentBar.getBoundingClientRect().bottom;
        scroller.scrollTop = Math.max(0, top);
        root.style.scrollBehavior = previous;
      };

      align();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const currentBar = document.querySelector('.site-header__bar');
          if (!(currentBar instanceof HTMLElement)) return;
          const gap = Math.abs(el.getBoundingClientRect().top - currentBar.getBoundingClientRect().bottom);
          if (gap > 8) align();
        });
      });
    };

    const waitClosed = () => {
      const header = document.querySelector('.site-header');
      const closed = !header?.classList.contains('is-open') && document.body.style.overflow !== 'hidden';
      if (closed) {
        requestAnimationFrame(() => requestAnimationFrame(start));
        return;
      }
      requestAnimationFrame(waitClosed);
    };

    requestAnimationFrame(waitClosed);
  };

  return (
    <>
      <header className={`site-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-open' : ''}`}>
        <div className="site-header__bar">
          <a
            href="#hero"
            className="site-header__brand"
            aria-label="Flow Residencial — início"
            onClick={(event) => {
              event.preventDefault();
              closeMenu();
              scrollToTop();
            }}
          >
            <Picture
              name="flow-logo"
              alt="Flow Residencial"
              className="site-header__logo"
              sizes="200px"
              width={180}
              height={72}
              loading="eager"
              fetchPriority="high"
            />

          </a>

          <nav className="site-header__nav" aria-label="Navegação principal">
            <ul className="site-header__list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    className="site-header__link"
                    href={link.href}
                    onClick={(event) => {
                      if (link.href !== '#hero') return;
                      event.preventDefault();
                      scrollToTop();
                    }}
                    {...(link.href === '#interesse' ? { 'data-abrir-formulario': '' } : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__actions">
            <a className="site-header__cta" href="#interesse" data-abrir-formulario="">
              Receber condições
            </a>

            <button
              ref={btnRef}
              type="button"
              className="site-header__toggle"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="site-header__toggle-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`site-header__mobile${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="site-header__mobile-panel">
          <nav aria-label="Menu mobile">
            <ul className="site-header__mobile-list">
              {navLinks.map((link, index) => (
                <li key={link.href} style={{ transitionDelay: menuOpen ? `${80 + index * 40}ms` : '0ms' }}>
                  <a
                    href={link.href}
                    onClick={(event) => {
                      if (link.href === '#interesse') {
                        if (!event.defaultPrevented) closeMenu();
                        return;
                      }
                      event.preventDefault();
                      closeMenu();
                      if (link.href === '#hero') {
                        scrollToTop();
                        return;
                      }
                      scrollToHash(link.href);
                    }}
                    tabIndex={menuOpen ? 0 : -1}
                    {...(link.href === '#interesse' ? { 'data-abrir-formulario': '' } : {})}
                  >
                    <span className="site-header__mobile-index">0{index + 1}</span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <a
            className="site-header__mobile-cta"
            href="#interesse"
            data-abrir-formulario=""
            onClick={(event) => {
              if (!event.defaultPrevented) closeMenu();
            }}
            tabIndex={menuOpen ? 0 : -1}
          >
            Receber condições
          </a>
        </div>
      </div>

      <style>{`
        .site-header {
          position: fixed;
          top: 0.9rem;
          left: 0;
          right: 0;
          z-index: 50;
          padding-inline: 1rem;
          pointer-events: none;
        }

        .site-header__bar {
          pointer-events: auto;
          width: min(100%, 1140px);
          margin-inline: auto;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.85rem;
          min-height: 4.1rem;
          padding: 0.45rem 0.55rem 0.45rem 0.95rem;
          border-radius: var(--raio-botao);
          background: var(--cor-fundo);
          border: 1px solid var(--cor-borda);
          box-shadow: var(--sombra-botao);
          transition:
            background 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .site-header.is-scrolled .site-header__bar {
          background: var(--cor-fundo);
          border-color: var(--cor-borda);
          box-shadow: var(--sombra-botao);
        }

        .site-header.is-open .site-header__bar {
          background: var(--cor-fundo);
          border-color: var(--cor-borda);
          box-shadow: var(--sombra-botao);
        }

        .site-header__brand {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
          position: relative;
          z-index: 2;
        }

        .site-header__brand picture {
          display: block;
          height: 3.35rem;
          width: auto;
          max-width: 180px;
          transition: height 0.3s ease;
        }

        .site-header__logo {
          height: 100%;
          width: auto;
          max-width: 180px;
          object-fit: contain;
          display: block;
          transition: mix-blend-mode 0.01s linear;
        }

        .site-header:not(.is-scrolled):not(.is-open) .site-header__logo {
          mix-blend-mode: normal;
        }

        .site-header.is-scrolled .site-header__logo,
        .site-header.is-open .site-header__logo {
          mix-blend-mode: normal;
        }

        .site-header__nav {
          display: none;
          justify-content: center;
        }

        .site-header__list {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.1rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .site-header__link {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 0.75rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 600;
          font-size: 0.84rem;
          letter-spacing: 0.02em;
          text-decoration: none;
          color: var(--cor-texto);
          text-shadow: 0 1px 2px color-mix(in srgb, var(--cor-fundo-profundo) 25%, transparent);
        }

        .site-header.is-scrolled .site-header__link,
        .site-header.is-open .site-header__link {
          color: var(--cor-texto);
          text-shadow: none;
        }

        .site-header__link::after {
          content: '';
          position: absolute;
          left: 0.75rem;
          right: 0.75rem;
          bottom: 0.24rem;
          height: 2px;
          border-radius: 999px;
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: 11s infinite flow-shift-x;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.25s ease;
        }

        .site-header.is-scrolled .site-header__link::after,
        .site-header.is-open .site-header__link::after {
          background-color: var(--cor-realce);
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          animation: 11s infinite flow-shift-x;
        }

        .site-header__link:hover::after,
        .site-header__link:focus-visible::after {
          transform: scaleX(1);
        }

        .site-header__actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.45rem;
        }

        .site-header__cta {
          display: none;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0.6rem 1.25rem;
          border-radius: var(--raio-botao);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
          text-decoration: none;
          color: var(--cor-texto);
          background-image: var(--gradiente-botao);
          background-size: 240% 100%;
          animation: 9s infinite flow-shift-x;
          box-shadow: var(--sombra-botao);
          transition: transform 0.2s ease, filter 0.2s ease;
        }

        .site-header__cta:hover,
        .site-header__cta:focus-visible {
          filter: brightness(1.05);
          transform: translateY(-0.25rem);
          color: var(--cor-texto);
        }

        .site-header__toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid var(--cor-borda);
          border-radius: var(--raio-botao);
          background: var(--cor-superficie);
          color: var(--cor-texto);
          cursor: pointer;
          position: relative;
          z-index: 2;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .site-header.is-scrolled .site-header__toggle,
        .site-header.is-open .site-header__toggle {
          border-color: var(--cor-borda);
          background: var(--cor-superficie);
          color: var(--cor-texto);
        }

        .site-header__toggle-icon {
          display: grid;
          gap: 4px;
          width: 15px;
        }

        .site-header__toggle-icon span {
          display: block;
          height: 1.5px;
          width: 100%;
          border-radius: var(--raio-botao);
          background: currentColor;
          transition: transform 0.25s ease, opacity 0.25s ease;
          transform-origin: center;
        }

        .site-header.is-open .site-header__toggle-icon span:nth-child(1) {
          transform: translateY(5.5px) rotate(45deg);
        }

        .site-header.is-open .site-header__toggle-icon span:nth-child(2) {
          opacity: 0;
        }

        .site-header.is-open .site-header__toggle-icon span:nth-child(3) {
          transform: translateY(-5.5px) rotate(-45deg);
        }

        .site-header__mobile {
          position: fixed;
          inset: 0;
          z-index: 49;
          background: var(--cor-fundo);
          display: flex;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .site-header__mobile.is-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .site-header__mobile-panel {
          width: min(100% - 2rem, 28rem);
          margin: auto;
          padding: 6.5rem 0 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .site-header__mobile-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 0.35rem;
        }

        .site-header__mobile-list li {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }

        .site-header__mobile.is-open .site-header__mobile-list li {
          opacity: 1;
          transform: none;
        }

        .site-header__mobile-list a {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          padding: 0.95rem 0.25rem;
          border-bottom: 1px solid color-mix(in srgb, var(--cor-texto) 10%, transparent);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: clamp(1.35rem, 5vw, 1.75rem);
          color: var(--cor-texto);
          text-decoration: none;
        }

        .site-header__mobile-index {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          background-image: var(--gradiente-texto);
          background-size: 280% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: 11s infinite flow-shift-x;
        }

        .site-header__mobile-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0.9rem 1.5rem;
          border-radius: var(--raio-botao);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--cor-texto);
          background-image: var(--gradiente-botao);
          background-size: 240% 100%;
          animation: 9s infinite flow-shift-x;
          box-shadow: var(--sombra-botao);
          text-decoration: none;
        }

        @media (min-width: 960px) {
          .site-header {
            top: 1.1rem;
            padding-inline: 1.5rem;
          }

          .site-header__bar {
            min-height: 4.35rem;
            padding: 0.5rem 0.65rem 0.5rem 1.1rem;
          }

          .site-header__brand picture {
            height: 3.75rem;
            max-width: 200px;
          }

          .site-header__nav {
            display: flex;
          }

          .site-header__cta {
            display: inline-flex;
          }

          .site-header__toggle,
          .site-header__mobile {
            display: none;
          }
        }

        @media (max-width: 959px) {
          .site-header__bar {
            grid-template-columns: 1fr auto;
          }

          .site-header__brand picture {
            height: 3.1rem;
            max-width: 165px;
          }
        }
      `}</style>
    </>
  );
}
