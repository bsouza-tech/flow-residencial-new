import { siteContent } from './content';

export interface GenesisStat {
  value: number;
  suffix: string;
  label: string;
}

export const genesisStats: GenesisStat[] = siteContent.about.stats;
