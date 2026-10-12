import fs from 'node:fs';

const res = await fetch(
  'https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome'
);
const json = await res.json();

const cities = json
  .map((m) => {
    const uf =
      m.microrregiao?.mesorregiao?.UF?.sigla ||
      m['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla ||
      '';
    return uf ? { city: m.nome, uf } : null;
  })
  .filter(Boolean);

const outPath = new URL('../src/data/brazilianCities.json', import.meta.url);
fs.writeFileSync(outPath, JSON.stringify(cities), 'utf8');
console.log(`wrote ${cities.length} cities to ${outPath.pathname}`);
