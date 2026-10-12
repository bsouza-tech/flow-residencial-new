import { optimizedFullSrc, type OptimizedImageName } from './optimizedImages';

export interface Certification {
  id: string;
  name: string;
  description: string;
  imageName: OptimizedImageName;
  src: string;
  alt: string;
}

export const certifications: Certification[] = [
  {
    id: 'nivel-a',
    name: 'Nível A',
    description: 'SiAC · PBQP-H',
    imageName: 'nivel-a',
    src: optimizedFullSrc('nivel-a'),
    alt: 'Selo SiAC PBQP-H Nível A — ABS Quality Evaluations',
  },
  {
    id: 'pbqp-h',
    name: 'PBQP-H',
    description: 'Qualidade do Habitat',
    imageName: 'pbqp-h',
    src: optimizedFullSrc('pbqp-h'),
    alt: 'Selo PBQP-H — Programa Brasileiro da Qualidade e Produtividade do Habitat',
  },
  {
    id: 'caixa',
    name: 'Caixa',
    description: 'Parceria financeira',
    imageName: 'caixa',
    src: optimizedFullSrc('caixa'),
    alt: 'Logo Caixa Econômica Federal',
  },
  {
    id: 'iso-9001',
    name: 'ISO 9001',
    description: 'Gestão da Qualidade',
    imageName: 'iso-9001',
    src: optimizedFullSrc('iso-9001'),
    alt: 'Certificação ISO 9001 — ABS Quality Evaluations',
  },
];
