import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, Marker as LeafletMarker, PopupOptions } from 'leaflet';
import { nearbyPlaces, projectLocation, type NearbyPlace } from '../../data/pointsOfInterest';
import { poiIconSvg } from './PoiIcons';

type LeafletNS = typeof import('leaflet');

type Props = {
  activeId: string | null;
  onSelect: (id: string) => void;
};

function makePin(L: LeafletNS, icon: NearbyPlace['icon'] | 'home', large = false) {
  const size = large ? 44 : 34;
  const tip = large ? 52 : 40;
  const glyph = poiIconSvg(icon === 'home' ? 'home' : icon, large ? 16 : 13);

  return L.divIcon({
    className: 'location-pin',
    iconSize: [size, tip],
    iconAnchor: [size / 2, tip],
    html: `
      <div class="location-pin__body${large ? ' is-home' : ''}" style="width:${size}px;height:${tip}px">
        <span class="location-pin__bubble">${glyph}</span>
        <span class="location-pin__point"></span>
      </div>
    `,
  });
}

function tipHtml(title: string, meta: string | undefined, icon: NearbyPlace['icon'] | 'home') {
  const glyph = poiIconSvg(icon === 'home' ? 'home' : icon, 15, '#1c92a0');
  return `
    <div class="location-tip">
      <span class="location-tip__icon" aria-hidden="true">${glyph}</span>
      <div class="location-tip__copy">
        <strong class="location-tip__title">${title}</strong>
        ${meta ? `<span class="location-tip__meta">${meta}</span>` : ''}
      </div>
    </div>
  `;
}

export default function LocationMap({ activeId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const onSelectRef = useRef(onSelect);
  const [interactive, setInteractive] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const leafletRef = useRef<LeafletNS | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void (async () => {
          const [{ default: cssHref }, mod] = await Promise.all([
            import('leaflet/dist/leaflet.css?url'),
            import('leaflet'),
          ]);
          if (cancelled) return;
          if (!document.querySelector('link[data-leaflet-css]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssHref;
            link.setAttribute('data-leaflet-css', 'true');
            document.head.appendChild(link);
          }
          leafletRef.current = mod;
          setLeafletReady(true);
        })();
      },
      { rootMargin: '400px' }
    );

    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    if (!leafletReady || !L || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [projectLocation.lat, projectLocation.lng],
      zoom: 14,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      attributionControl: true,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    const select = (id: string) => onSelectRef.current(id);

    const popupOptions: PopupOptions = {
      closeButton: false,
      offset: [0, -14],
      className: 'location-tip-popup',
      maxWidth: 260,
      minWidth: 180,
      autoPan: true,
      autoPanPadding: [28, 28],
    };

    const home = L.marker([projectLocation.lat, projectLocation.lng], {
      icon: makePin(L, 'home', true),
      title: projectLocation.name,
      zIndexOffset: 1000,
    }).addTo(map);

    home.bindPopup(tipHtml(projectLocation.name, 'Empreendimento', 'home'), popupOptions);
    home.on('click', () => select(projectLocation.id));
    markersRef.current[projectLocation.id] = home;

    nearbyPlaces.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], {
        icon: makePin(L, place.icon),
        title: place.name,
      }).addTo(map);

      marker.bindPopup(tipHtml(place.name, place.distance, place.icon), popupOptions);
      marker.on('click', () => select(place.id));
      markersRef.current[place.id] = marker;
    });

    mapRef.current = map;

    const resize = () => map.invalidateSize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(resize);

    return () => {
      window.removeEventListener('resize', resize);
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, [leafletReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (interactive) {
      map.dragging.enable();
      map.scrollWheelZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    } else {
      map.dragging.disable();
      map.scrollWheelZoom.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    }
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeId) return;

    const marker = markersRef.current[activeId];
    if (!marker) return;

    Object.entries(markersRef.current).forEach(([id, m]) => {
      if (id !== activeId) m.closePopup();
    });

    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.55 });
    marker.openPopup();
  }, [activeId, leafletReady]);

  return (
    <div className={`location-map${interactive ? ' is-active' : ''}`}>
      <div ref={containerRef} className="location-map__canvas" role="presentation" />

      {!interactive && (
        <button
          type="button"
          className="location-map__activate"
          onClick={() => setInteractive(true)}
        >
          <span>Clique para ativar o mapa</span>
        </button>
      )}

      {interactive && (
        <button
          type="button"
          className="location-map__lock"
          onClick={() => setInteractive(false)}
        >
          Bloquear mapa
        </button>
      )}
    </div>
  );
}
