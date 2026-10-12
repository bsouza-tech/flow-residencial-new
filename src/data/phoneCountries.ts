export interface PhoneCountry {
  iso: string;
  name: string;
  dial: string;
  maxDigits: number;
  mask: string;
  placeholder: string;
}

/** Países mais comuns para o seletor de telefone (DDI + máscara). */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: 'BR', name: 'Brasil', dial: '55', maxDigits: 11, mask: '(##) #####-####', placeholder: '(21) 99999-9999' },
  { iso: 'AR', name: 'Argentina', dial: '54', maxDigits: 10, mask: '## ####-####', placeholder: '11 2345-6789' },
  { iso: 'BO', name: 'Bolívia', dial: '591', maxDigits: 8, mask: '########', placeholder: '71234567' },
  { iso: 'CL', name: 'Chile', dial: '56', maxDigits: 9, mask: '# #### ####', placeholder: '9 1234 5678' },
  { iso: 'CO', name: 'Colômbia', dial: '57', maxDigits: 10, mask: '### ### ####', placeholder: '300 123 4567' },
  { iso: 'EC', name: 'Equador', dial: '593', maxDigits: 9, mask: '## ### ####', placeholder: '99 123 4567' },
  { iso: 'PY', name: 'Paraguai', dial: '595', maxDigits: 9, mask: '### ######', placeholder: '981 123456' },
  { iso: 'PE', name: 'Peru', dial: '51', maxDigits: 9, mask: '### ### ###', placeholder: '912 345 678' },
  { iso: 'UY', name: 'Uruguai', dial: '598', maxDigits: 8, mask: '#### ####', placeholder: '9123 4567' },
  { iso: 'MX', name: 'México', dial: '52', maxDigits: 10, mask: '## #### ####', placeholder: '55 1234 5678' },
  { iso: 'US', name: 'Estados Unidos', dial: '1', maxDigits: 10, mask: '(###) ###-####', placeholder: '(201) 555-0123' },
  { iso: 'CA', name: 'Canadá', dial: '1', maxDigits: 10, mask: '(###) ###-####', placeholder: '(416) 555-0123' },
  { iso: 'PT', name: 'Portugal', dial: '351', maxDigits: 9, mask: '### ### ###', placeholder: '912 345 678' },
  { iso: 'ES', name: 'Espanha', dial: '34', maxDigits: 9, mask: '### ## ## ##', placeholder: '612 34 56 78' },
  { iso: 'IT', name: 'Itália', dial: '39', maxDigits: 10, mask: '### ### ####', placeholder: '312 345 6789' },
  { iso: 'FR', name: 'França', dial: '33', maxDigits: 9, mask: '# ## ## ## ##', placeholder: '6 12 34 56 78' },
  { iso: 'DE', name: 'Alemanha', dial: '49', maxDigits: 11, mask: '#### #######', placeholder: '1512 3456789' },
  { iso: 'GB', name: 'Reino Unido', dial: '44', maxDigits: 10, mask: '#### ######', placeholder: '7400 123456' },
  { iso: 'AO', name: 'Angola', dial: '244', maxDigits: 9, mask: '### ### ###', placeholder: '923 456 789' },
  { iso: 'JP', name: 'Japão', dial: '81', maxDigits: 10, mask: '## #### ####', placeholder: '90 1234 5678' },
];

export const DEFAULT_PHONE_COUNTRY =
  PHONE_COUNTRIES.find((country) => country.iso === 'BR') ?? PHONE_COUNTRIES[0];

export function getPhoneCountry(iso: string): PhoneCountry {
  return PHONE_COUNTRIES.find((country) => country.iso === iso) ?? DEFAULT_PHONE_COUNTRY;
}

/** Imagem da bandeira (evita emoji que no Windows vira "BR", "US", etc.). */
export function getCountryFlagUrl(iso: string, width = 40) {
  return `https://flagcdn.com/w${width}/${iso.toLowerCase()}.png`;
}

export function applyPhoneMask(digits: string, mask: string) {
  let i = 0;
  let out = '';
  for (const char of mask) {
    if (i >= digits.length) break;
    if (char === '#') {
      out += digits[i];
      i += 1;
    } else {
      out += char;
    }
  }
  return out;
}

export function nationalPhoneDigits(value: string, country: PhoneCountry) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith(country.dial) && digits.length > country.maxDigits) {
    digits = digits.slice(country.dial.length);
  }
  return digits.slice(0, country.maxDigits);
}

export function maskNationalPhone(value: string, country: PhoneCountry) {
  const digits = nationalPhoneDigits(value, country);
  return applyPhoneMask(digits, country.mask);
}

export function toE164(nationalMasked: string, country: PhoneCountry) {
  const digits = nationalPhoneDigits(nationalMasked, country);
  if (digits.length !== country.maxDigits) return '';
  return `+${country.dial}${digits}`;
}

export function isValidNationalPhone(nationalMasked: string, country: PhoneCountry) {
  return nationalPhoneDigits(nationalMasked, country).length === country.maxDigits;
}
