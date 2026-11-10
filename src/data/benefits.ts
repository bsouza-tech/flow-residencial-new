import { siteContent } from './content';

export interface Benefit {
  id: string;
  title: string;
  description: string | null;
}

export const benefits: Benefit[] = siteContent.benefits.items;
