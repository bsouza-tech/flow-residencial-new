export interface BrazilianCity {
  city: string;
  uf: string;
}

let citiesCache: BrazilianCity[] | null = null;
let citiesPromise: Promise<BrazilianCity[]> | null = null;

/** Carrega o JSON sob demanda (chunk separado do bundle do formulário). */
export function preloadBrazilianCities(): Promise<BrazilianCity[]> {
  if (citiesCache) return Promise.resolve(citiesCache);
  if (!citiesPromise) {
    citiesPromise = import('./brazilianCities.json').then((mod) => {
      citiesCache = mod.default as BrazilianCity[];
      return citiesCache;
    });
  }
  return citiesPromise;
}

function normalizeCityQuery(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function filterFromList(cities: BrazilianCity[], query: string, limit: number): BrazilianCity[] {
  const q = normalizeCityQuery(query);
  if (!q) return cities.slice(0, limit);

  const starts: BrazilianCity[] = [];
  const includes: BrazilianCity[] = [];

  for (const item of cities) {
    const name = normalizeCityQuery(item.city);
    if (name.startsWith(q)) starts.push(item);
    else if (name.includes(q)) includes.push(item);
    if (starts.length >= limit) break;
  }

  return [...starts, ...includes].slice(0, limit);
}

/** Usa cache se já carregado; senão retorna [] (chame preloadBrazilianCities antes). */
export function filterCities(query: string, limit = 12): BrazilianCity[] {
  if (!citiesCache) return [];
  return filterFromList(citiesCache, query, limit);
}

export function findCityExact(city: string, uf?: string): BrazilianCity | undefined {
  if (!citiesCache) return undefined;
  const name = normalizeCityQuery(city);
  const matches = citiesCache.filter((item) => normalizeCityQuery(item.city) === name);
  if (uf) {
    const upper = uf.toUpperCase();
    return matches.find((item) => item.uf === upper);
  }
  return matches.length === 1 ? matches[0] : undefined;
}
