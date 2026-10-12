# solar-bellavista

Astro + React islands + Tailwind CSS v4 — landing do Solar Bellavista.

Ver [README.md](./README.md) para setup e estrutura.

## Development Server

```bash
pnpm dev
```

Servidor Astro na porta `$PORT` (padrão **8443**).

## Hydration

Componentes React interativos usam `client:only="react"` (Leaflet/GSAP e APIs de browser não rodam em SSR).
