import type { PoiIcon } from '../../data/pointsOfInterest';

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function PoiGlyph({ icon, size = 18 }: { icon: PoiIcon; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true as const };

  switch (icon) {
    case 'home':
      return (
        <svg {...props}>
          <path {...stroke} d="M3 10.5 12 3l9 7.5" />
          <path {...stroke} d="M5.5 9.5V21h13V9.5" />
          <path {...stroke} d="M10 21v-6h4v6" />
        </svg>
      );
    case 'club':
      return (
        <svg {...props}>
          <path {...stroke} d="M4 21h16" />
          <path {...stroke} d="M6 21V8l6-4 6 4v13" />
          <path {...stroke} d="M10 21v-5h4v5" />
          <path {...stroke} d="M9 11h6" />
        </svg>
      );
    case 'pharmacy':
      return (
        <svg {...props}>
          <rect {...stroke} x="7" y="3" width="10" height="18" rx="3" />
          <path {...stroke} d="M12 8v8M8 12h8" />
        </svg>
      );
    case 'bakery':
      return (
        <svg {...props}>
          <path {...stroke} d="M17 8a5 5 0 0 0-10 0c0 2.5 1.5 3.5 2 5.5.3 1.2.4 2.5.4 3.5h5.2c0-1 .1-2.3.4-3.5.5-2 2-3 2-5.5Z" />
          <path {...stroke} d="M9 21h6" />
        </svg>
      );
    case 'park':
      return (
        <svg {...props}>
          <path {...stroke} d="M12 22v-7" />
          <path {...stroke} d="M12 15c-4 0-6-2.5-6-5.5S9 4 12 4s6 2.5 6 5.5S16 15 12 15Z" />
          <path {...stroke} d="M8 22h8" />
        </svg>
      );
    case 'bus':
      return (
        <svg {...props}>
          <rect {...stroke} x="5" y="3" width="14" height="14" rx="2" />
          <path {...stroke} d="M5 10h14" />
          <circle {...stroke} cx="8.5" cy="19" r="1.5" />
          <circle {...stroke} cx="15.5" cy="19" r="1.5" />
          <path {...stroke} d="M8 6h.01M12 6h.01M16 6h.01" />
        </svg>
      );
    case 'gym':
      return (
        <svg {...props}>
          <path {...stroke} d="M6.5 9v6M17.5 9v6M3.5 10.5v3M20.5 10.5v3M6.5 12h11" />
          <path {...stroke} d="M6.5 9.5h-1.5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1H6.5" />
          <path {...stroke} d="M17.5 9.5h1.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H17.5" />
        </svg>
      );
    case 'hospital':
      return (
        <svg {...props}>
          <path {...stroke} d="M3 21h18" />
          <path {...stroke} d="M5 21V7l7-4 7 4v14" />
          <path {...stroke} d="M12 10v6M9 13h6" />
        </svg>
      );
    default:
      return null;
  }
}

/** SVG inline para DivIcon do Leaflet / tooltips. */
export function poiIconSvg(icon: PoiIcon, size = 14, stroke = 'white') {
  const common = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
  switch (icon) {
    case 'home':
      return `<svg ${common}><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M10 21v-6h4v6"/></svg>`;
    case 'club':
      return `<svg ${common}><path d="M4 21h16"/><path d="M6 21V8l6-4 6 4v13"/><path d="M10 21v-5h4v5"/></svg>`;
    case 'pharmacy':
      return `<svg ${common}><rect x="7" y="3" width="10" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>`;
    case 'bakery':
      return `<svg ${common}><path d="M17 8a5 5 0 0 0-10 0c0 2.5 1.5 3.5 2 5.5.3 1.2.4 2.5.4 3.5h5.2c0-1 .1-2.3.4-3.5.5-2 2-3 2-5.5Z"/><path d="M9 21h6"/></svg>`;
    case 'park':
      return `<svg ${common}><path d="M12 22v-7"/><path d="M12 15c-4 0-6-2.5-6-5.5S9 4 12 4s6 2.5 6 5.5S16 15 12 15Z"/></svg>`;
    case 'bus':
      return `<svg ${common}><rect x="5" y="3" width="14" height="14" rx="2"/><path d="M5 10h14"/><circle cx="8.5" cy="19" r="1.5"/><circle cx="15.5" cy="19" r="1.5"/></svg>`;
    case 'gym':
      return `<svg ${common}><path d="M6.5 9v6M17.5 9v6M3.5 10.5v3M20.5 10.5v3M6.5 12h11"/></svg>`;
    case 'hospital':
      return `<svg ${common}><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M12 10v6M9 13h6"/></svg>`;
    default:
      return '';
  }
}
