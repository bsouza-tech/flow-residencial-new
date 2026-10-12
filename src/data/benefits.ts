export interface Benefit {
  id: string;
  title: string;
  description: string;
}

export const benefits: Benefit[] = [
  {
    id: 'seguranca',
    title: 'Segurança para a família',
    description: 'Condomínio fechado com portaria e infraestrutura pensada para que você viva com tranquilidade, sem abrir mão do conforto.',
  },
  {
    id: 'lazer',
    title: 'Lazer sem sair de casa',
    description: 'Piscina, academia, churrasqueira e playground reunidos para que cada dia seja especial, dentro do seu próprio condomínio.',
  },
  {
    id: 'localizacao',
    title: 'Perto do que importa',
    description: 'Localizado em Teresópolis, com fácil acesso a escolas, comércio e serviços, tudo o que faz parte da rotina da sua família.',
  },
  {
    id: 'conforto',
    title: 'Conforto no dia a dia',
    description: 'Plantas funcionais e bem distribuídas para que você se sinta em casa desde o primeiro dia, com espaço para o que realmente importa.',
  },
];
