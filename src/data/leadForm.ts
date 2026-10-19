export const EMPREENDIMENTO = 'Flow Residencial';

export const RELATIONSHIP_OPTIONS = [
  'Solteiro(a)',
  'Namorando',
  'Noivo(a)',
  'Casado(a) / União estável',
  'Viúvo(a)',
] as const;

export const CHILDREN_OPTIONS = [
  'Não',
  '1 Filho(a)',
  '2 Filhos(as)',
  '3 Filhos(as)',
  'Mais de 3 Filhos(as)',
] as const;

export const INCOME_OPTIONS = [
  'Até R$ 3 mil',
  'R$ 3 a 5 mil',
  'R$ 5 a 8 mil',
  'R$ 8 a 12 mil',
  'R$ 12 a 20 mil',
  'Acima de R$ 20 mil',
] as const;

export const GENDER_OPTIONS = [
  { label: 'Masculino', value: 'masculino' },
  { label: 'Feminino', value: 'feminino' },
  { label: 'Prefiro não dizer', value: 'prefiro_nao_dizer' },
] as const;

export const PROFILE_OPTIONS = ['Morador', 'Investidor', 'Corretor'] as const;

/** Lista para autocomplete de profissão (texto livre ainda é permitido). */
export const PROFESSION_OPTIONS = [
  'Administrador',
  'Adestrador',
  'Advogado',
  'Agente de viagens',
  'Agricultor',
  'Agrônomo',
  'Alfaiate',
  'Analista de marketing',
  'Analista de RH',
  'Analista de sistemas',
  'Analista financeiro',
  'Animador',
  'Apresentador',
  'Árbitro',
  'Arquiteto',
  'Assistente administrativo',
  'Atendente',
  'Atleta',
  'Ator',
  'Auditor',
  'Auxiliar administrativo',
  'Auxiliar de cozinha',
  'Auxiliar de enfermagem',
  'Auxiliar de produção',
  'Auxiliar veterinário',
  'Babá',
  'Bancário',
  'Barbeiro',
  'Barista',
  'Bartender',
  'Biomédico',
  'Biólogo',
  'Bombeiro',
  'Cabeleireiro',
  'Caixa',
  'Caminhoneiro',
  'Cantor',
  'Cerimonialista',
  'Chaveiro',
  'Chef',
  'Cientista de dados',
  'Comissário de bordo',
  'Confeiteiro',
  'Consultor',
  'Contador',
  'Copywriter',
  'Corretor',
  'Corretor de imóveis',
  'Corretor de seguros',
  'Costureiro',
  'Cozinheiro',
  'Cuidador de idosos',
  'Dançarino',
  'Decorador',
  'Dentista',
  'Desenvolvedor',
  'Despachante',
  'Designer',
  'Diarista',
  'DJ',
  'Economista',
  'Editor de vídeo',
  'Eletricista',
  'Empreendedor',
  'Empresário',
  'Encanador',
  'Enfermeiro',
  'Engenheiro',
  'Entregador',
  'Especialista em SEO',
  'Escritor',
  'Esteticista',
  'Estilista',
  'Farmacêutico',
  'Físico',
  'Fisioterapeuta',
  'Florista',
  'Fonoaudiólogo',
  'Fotógrafo',
  'Garçom',
  'Geólogo',
  'Gerente comercial',
  'Gerente de projetos',
  'Gestor de tráfego',
  'Guia turístico',
  'Ilustrador',
  'Influenciador',
  'Instalador de ar-condicionado',
  'Investigador',
  'Jardineiro',
  'Joalheiro',
  'Jornalista',
  'Locutor',
  'Manicure',
  'Maquiador',
  'Marceneiro',
  'Massoterapeuta',
  'Mecânico',
  'Médico',
  'Modelo',
  'Motoboy',
  'Motorista',
  'Músico',
  'Nutricionista',
  'Operador de máquinas',
  'Operador de telemarketing',
  'Organizador de eventos',
  'Ourives',
  'Padeiro',
  'Paisagista',
  'Pedagogo',
  'Pedicure',
  'Pedreiro',
  'Personal trainer',
  'Pet sitter',
  'Piercer',
  'Piloto',
  'Pintor',
  'Pizzaiolo',
  'Podólogo',
  'Policial',
  'Porteiro',
  'Product manager',
  'Produtor de conteúdo',
  'Produtor musical',
  'Professor',
  'Programador',
  'Psicólogo',
  'Químico',
  'Recepcionista',
  'Recepcionista de hotel',
  'Recrutador',
  'Relojoeiro',
  'Representante comercial',
  'Roteirista',
  'Sapateiro',
  'Secretário',
  'Serralheiro',
  'Síndico',
  'Social media',
  'Soldador',
  'Streamer',
  'Tatuador',
  'Técnico de celular',
  'Técnico de informática',
  'Técnico de refrigeração',
  'Técnico eletrônico',
  'Técnico eletrotécnico',
  'Técnico em segurança do trabalho',
  'Terapeuta ocupacional',
  'Tosador',
  'Tradutor',
  'Treinador',
  'UI designer',
  'UX designer',
  'Vendedor',
  'Vendedor de loja',
  'Veterinário',
  'Videomaker',
  'Vigilante',
  'Zelador',
  'Zootecnista',
] as const;

export const WIZARD_STEPS = 8;

export function filterProfessions(query: string, limit = 12): string[] {
  const q = query.trim().toLocaleLowerCase('pt-BR');
  if (!q) return PROFESSION_OPTIONS.slice(0, limit);

  const starts: string[] = [];
  const includes: string[] = [];

  for (const profession of PROFESSION_OPTIONS) {
    const normalized = profession.toLocaleLowerCase('pt-BR');
    if (normalized.startsWith(q)) starts.push(profession);
    else if (normalized.includes(q)) includes.push(profession);
  }

  return [...starts, ...includes].slice(0, limit);
}

export type RelationshipStatus = (typeof RELATIONSHIP_OPTIONS)[number];
export type ChildrenStatus = (typeof CHILDREN_OPTIONS)[number];
export type MonthlyIncome = (typeof INCOME_OPTIONS)[number];
export type Sexo = (typeof GENDER_OPTIONS)[number]['value'];
export type ProfileType = (typeof PROFILE_OPTIONS)[number];

export interface BasicLeadPayload {
  nome: string;
  email: string;
  telefone: string;
}

export interface ProfileLeadPayload {
  relationship_status: RelationshipStatus;
  children_status: ChildrenStatus;
  profession: string;
  monthly_income: MonthlyIncome;
  sexo: Sexo;
  current_city: string;
  uf: string;
  birth_date: string;
  profile_type: ProfileType;
  profile_completed?: boolean;
}

export function isRelationshipStatus(value: string): value is RelationshipStatus {
  return (RELATIONSHIP_OPTIONS as readonly string[]).includes(value);
}

export function isChildrenStatus(value: string): value is ChildrenStatus {
  return (CHILDREN_OPTIONS as readonly string[]).includes(value);
}

export function isMonthlyIncome(value: string): value is MonthlyIncome {
  return (INCOME_OPTIONS as readonly string[]).includes(value);
}

export function isSexo(value: string): value is Sexo {
  return GENDER_OPTIONS.some((option) => option.value === value);
}

export function isProfileType(value: string): value is ProfileType {
  return (PROFILE_OPTIONS as readonly string[]).includes(value);
}

/** Converte DD/MM/AAAA → YYYY-MM-DD (ISO date). */
export function parseBirthDateBR(value: string): string | null {
  const trimmed = value.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (iso) {
    const date = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (!br) return null;
  const [, dd, mm, yyyy] = br;
  const date = new Date(`${yyyy}-${mm}-${dd}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== Number(yyyy) || date.getMonth() + 1 !== Number(mm) || date.getDate() !== Number(dd)) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

export function maskBirthDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
