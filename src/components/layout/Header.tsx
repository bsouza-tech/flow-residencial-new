import { useEffect, useRef, useState } from 'react';

import Picture from '../ui/Picture';


const navLinks = [
  { label: 'Início', href: '#hero' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Plantas', href: '#plantas' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Lazer', href: '#benfeitorias' },
  { label: 'Localização', href: '#localizacao' },
  { label: 'Formulário', href: '#interesse' },
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
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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
          <a href="#hero" className="site-header__brand" aria-label="Solar Bellavista — início" onClick={closeMenu}>
            <Picture
              name="solar-bellavista"
              alt="Solar Bellavista"
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
              Tenho interesse
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
                        closeMenu();
                        return;
                      }
                      event.preventDefault();
                      closeMenu();
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
            onClick={closeMenu}
            tabIndex={menuOpen ? 0 : -1}
          >
            Tenho interesse
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
          border-radius: 999px;
          background: rgba(1, 48, 52, 0.78);
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 10px 28px rgba(1, 48, 52, 0.18);
          transition:
            background 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }

        .site-header.is-scrolled .site-header__bar {
          background: rgba(255, 255, 255, 0.96);
          border-color: rgba(1, 48, 52, 0.08);
          box-shadow: 0 12px 30px rgba(1, 48, 52, 0.12);
        }

        .site-header.is-open .site-header__bar {
          background: rgba(255, 255, 255, 0.98);
          border-color: rgba(1, 48, 52, 0.08);
          box-shadow: 0 12px 30px rgba(1, 48, 52, 0.12);
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
          mix-blend-mode: screen;
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
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(1, 48, 52, 0.25);
          transition: color 0.2s ease;
        }

        .site-header.is-scrolled .site-header__link,
        .site-header.is-open .site-header__link {
          color: #2c2f31;
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
          background: #eb9c36;
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 0.25s ease;
        }

        .site-header.is-scrolled .site-header__link::after,
        .site-header.is-open .site-header__link::after {
          background: #1c92a0;
        }

        .site-header__link:hover,
        .site-header__link:focus-visible {
          color: #ffd166;
        }

        .site-header.is-scrolled .site-header__link:hover,
        .site-header.is-scrolled .site-header__link:focus-visible,
        .site-header.is-open .site-header__link:hover,
        .site-header.is-open .site-header__link:focus-visible {
          color: #1c92a0;
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
          border-radius: 999px;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
          text-decoration: none;
          color: #013034;
          background: #eb9c36;
          box-shadow: 0 8px 18px rgba(235, 156, 54, 0.32);
          transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
        }

        .site-header__cta:hover,
        .site-header__cta:focus-visible {
          background: #d88928;
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(235, 156, 54, 0.38);
          color: #013034;
        }

        .site-header__toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          cursor: pointer;
          position: relative;
          z-index: 2;
          transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }

        .site-header.is-scrolled .site-header__toggle,
        .site-header.is-open .site-header__toggle {
          border-color: rgba(1, 48, 52, 0.1);
          background: rgba(1, 48, 52, 0.04);
          color: #013034;
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
          border-radius: 999px;
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
          background:
            radial-gradient(80% 60% at 100% 0%, rgba(235, 156, 54, 0.18), transparent 55%),
            #013034;
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: clamp(1.35rem, 5vw, 1.75rem);
          color: #ffffff;
          text-decoration: none;
        }

        .site-header__mobile-list a:hover,
        .site-header__mobile-list a:focus-visible {
          color: #eb9c36;
        }

        .site-header__mobile-index {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #ffd166;
        }

        .site-header__mobile-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0.9rem 1.5rem;
          border-radius: 999px;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: #013034;
          background: #eb9c36;
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
