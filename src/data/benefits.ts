export interface Benefit {
  id: string;
  title: string;
  description: string | null;
}

export const benefits: Benefit[] = [
  {
    id: 'localizacao',
    title: 'Localização Privilegiada',
    description: 'No bairro N. S. de Fátima, em Teresópolis, com acesso fácil ao que você precisa no dia a dia.',
  },
  {
    id: 'condicoes',
    title: 'Condições Facilitadas',
    description: 'Planos pensados para o seu momento, com a equipe do Flow para apresentar as melhores condições.',
  },
  {
    id: 'tipologias',
    title: 'Tipologias Modernas',
    description: 'Quatro plantas versáteis, do studio à cobertura, com conforto e design otimizado.',
  },
  {
    id: 'lazer',
    title: 'Lazer Completo',
    description: 'Academia, fitness, gourmet, coworking, café e laundry no próprio condomínio.',
  },
];
