import { useEffect, useId, useRef, useState } from 'react';
import {
  filterCities,
  preloadBrazilianCities,
  type BrazilianCity,
} from '../../data/brazilianCities';
import {
  CHILDREN_OPTIONS,
  GENDER_OPTIONS,
  INCOME_OPTIONS,
  PROFILE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  WIZARD_STEPS,
  filterProfessions,
  maskBirthDate,
  parseBirthDateBR,
  type ChildrenStatus,
  type MonthlyIncome,
  type ProfileType,
  type RelationshipStatus,
  type Sexo,
} from '../../data/leadForm';
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  getCountryFlagUrl,
  getPhoneCountry,
  isValidNationalPhone,
  maskNationalPhone,
  toE164,
} from '../../data/phoneCountries';
import { animateSectionIntro } from '../../lib/animateIntro';
import { createLead, markWhatsappClicked, saveLeadStep } from '../../lib/leadsApi';
import { trackMeta } from '../../lib/metaPixel';
import { useSectionMotion } from '../../lib/useSectionMotion';

interface FormState {
  nome: string;
  telefone: string;
  email: string;
}

interface FormErrors {
  nome?: string;
  telefone?: string;
  email?: string;
}

interface ProfileState {
  relationship_status: RelationshipStatus | '';
  children_status: ChildrenStatus | '';
  profession: string;
  monthly_income: MonthlyIncome | '';
  sexo: Sexo | '';
  current_city: string;
  uf: string;
  birth_date: string;
  profile_type: ProfileType | '';
}

type ModalView = 'basic' | 'quase-la' | 'wizard' | 'done';

function validateBasic(form: FormState, countryIso: string): FormErrors {
  const country = getPhoneCountry(countryIso);
  const errors: FormErrors = {};
  if (!form.nome.trim() || form.nome.trim().length < 2) {
    errors.nome = 'Por favor, informe seu nome completo.';
  }
  if (!isValidNationalPhone(form.telefone, country)) {
    errors.telefone = `Informe um telefone válido (${country.placeholder}).`;
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(form.email.trim())) {
    errors.email = 'Informe um e-mail válido.';
  }
  return errors;
}

const emptyProfile = (): ProfileState => ({
  relationship_status: '',
  children_status: '',
  profession: '',
  monthly_income: '',
  sexo: '',
  current_city: '',
  uf: '',
  birth_date: '',
  profile_type: '',
});

const BIRTH_WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;
const BIRTH_MIN_YEAR = 1920;

function formatBirthFromParts(day: number, monthIndex: number, year: number) {
  const dd = String(day).padStart(2, '0');
  const mm = String(monthIndex + 1).padStart(2, '0');
  return `${dd}/${mm}/${year}`;
}

function getBirthCalendarCells(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<number | null> = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function birthYearOptions() {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= BIRTH_MIN_YEAR; year -= 1) years.push(year);
  return years;
}

export default function ConversionCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [formOpen, setFormOpen] = useState(false);
  const [view, setView] = useState<ModalView>('basic');
  const [wizardStep, setWizardStep] = useState(1);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ nome: '', telefone: '', email: '' });
  const [profile, setProfile] = useState<ProfileState>(emptyProfile);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [stepError, setStepError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [professionOpen, setProfessionOpen] = useState(false);
  const [professionHighlight, setProfessionHighlight] = useState(0);
  const professionListId = useId();
  const [cityOpen, setCityOpen] = useState(false);
  const [cityHighlight, setCityHighlight] = useState(0);
  const cityListId = useId();
  const [birthCalendarOpen, setBirthCalendarOpen] = useState(false);
  const [birthCalendarMonth, setBirthCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear() - 30, now.getMonth(), 1);
  });
  const [phoneCountryIso, setPhoneCountryIso] = useState(DEFAULT_PHONE_COUNTRY.iso);
  const [phoneCountryOpen, setPhoneCountryOpen] = useState(false);
  const phoneCountryListId = useId();

  const phoneCountry = getPhoneCountry(phoneCountryIso);
  const professionSuggestions = filterProfessions(profile.profession);
  const [citiesReady, setCitiesReady] = useState(false);
  const citySuggestions =
    citiesReady && view === 'wizard' ? filterCities(profile.current_city) : [];

  useEffect(() => {
    if (view !== 'wizard' && view !== 'quase-la') return;
    let cancelled = false;
    void preloadBrazilianCities().then(() => {
      if (!cancelled) setCitiesReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [view]);

  useSectionMotion(sectionRef, () => {
    animateSectionIntro(sectionRef.current?.querySelector('.cta__hero'), {
      eyebrow: '.cta__badge',
      text: '.cta__text',
      extras: '.cta__open',
    });
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (formOpen) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = 'hidden';
      window.setTimeout(() => {
        if (view === 'basic') document.getElementById('field-nome')?.focus();
      }, 50);
    } else if (dialog.open) {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [formOpen, view]);

  useEffect(() => {
    if (!phoneCountryOpen && !birthCalendarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setPhoneCountryOpen(false);
        setBirthCalendarOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [phoneCountryOpen, birthCalendarOpen]);

  const resetAll = () => {
    setView('basic');
    setWizardStep(1);
    setLeadId(null);
    setForm({ nome: '', telefone: '', email: '' });
    setProfile(emptyProfile());
    setErrors({});
    setTouched({});
    setStepError('');
    setSubmitError('');
    setLoading(false);
    setProfessionOpen(false);
    setProfessionHighlight(0);
    setCityOpen(false);
    setCityHighlight(0);
    setBirthCalendarOpen(false);
    setBirthCalendarMonth(() => {
      const now = new Date();
      return new Date(now.getFullYear() - 30, now.getMonth(), 1);
    });
    setPhoneCountryIso(DEFAULT_PHONE_COUNTRY.iso);
    setPhoneCountryOpen(false);
  };

  const openForm = () => {
    resetAll();
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    window.setTimeout(resetAll, 200);
  };

  const handleChange = (field: keyof FormState, value: string) => {
    const next = {
      ...form,
      [field]: field === 'telefone' ? maskNationalPhone(value, phoneCountry) : value,
    };
    setForm(next);
    if (touched[field]) {
      const errs = validateBasic(next, phoneCountryIso);
      setErrors((prev) => ({ ...prev, [field]: errs[field] }));
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validateBasic(form, phoneCountryIso);
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const selectPhoneCountry = (iso: string) => {
    const nextCountry = getPhoneCountry(iso);
    setPhoneCountryIso(iso);
    setPhoneCountryOpen(false);
    setForm((prev) => ({
      ...prev,
      telefone: maskNationalPhone(prev.telefone, nextCountry),
    }));
    if (touched.telefone) {
      setErrors((prev) => ({
        ...prev,
        telefone: validateBasic(
          { ...form, telefone: maskNationalPhone(form.telefone, nextCountry) },
          iso
        ).telefone,
      }));
    }
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateBasic(form, phoneCountryIso);
    setErrors(errs);
    setTouched({ nome: true, telefone: true, email: true });
    setSubmitError('');
    if (Object.keys(errs).length > 0) {
      const firstField = Object.keys(errs)[0] as keyof FormState;
      document.getElementById(`field-${firstField}`)?.focus();
      return;
    }

    const e164 = toE164(form.telefone, phoneCountry);
    if (!e164) {
      setErrors((prev) => ({ ...prev, telefone: 'Informe um telefone válido.' }));
      return;
    }

    setLoading(true);
    try {
      const id = await createLead({
        nome: form.nome.trim(),
        email: form.email.trim(),
        telefone: e164,
      });
      trackMeta('Lead', {
        params: {
          content_name: 'Solar Bellavista',
          content_category: 'formulario_basico',
        },
      });
      setLeadId(id);
      setView('quase-la');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const validateWizardStep = (step: number): string => {
    switch (step) {
      case 1:
        return profile.relationship_status ? '' : 'Selecione seu estado civil.';
      case 2:
        return profile.children_status ? '' : 'Selecione uma opção.';
      case 3:
        return profile.profession.trim().length >= 2 ? '' : 'Informe sua profissão.';
      case 4:
        return profile.monthly_income ? '' : 'Selecione sua renda familiar.';
      case 5:
        return profile.sexo ? '' : 'Selecione uma opção.';
      case 6:
        return profile.current_city.trim().length >= 2 && /^[A-Z]{2}$/.test(profile.uf)
          ? ''
          : 'Selecione uma cidade da lista.';
      case 7:
        return parseBirthDateBR(profile.birth_date) ? '' : 'Informe uma data válida (DD/MM/AAAA).';
      case 8:
        return profile.profile_type ? '' : 'Selecione seu perfil.';
      default:
        return '';
    }
  };

  const stepPayload = (step: number): Record<string, string> | null => {
    switch (step) {
      case 1:
        return { relationship_status: profile.relationship_status };
      case 2:
        return { children_status: profile.children_status };
      case 3:
        return { profession: profile.profession.trim() };
      case 4:
        return { monthly_income: profile.monthly_income };
      case 5:
        return { sexo: profile.sexo };
      case 6:
        return { current_city: profile.current_city.trim(), uf: profile.uf };
      case 7:
        return { birth_date: parseBirthDateBR(profile.birth_date) ?? '' };
      case 8:
        return { profile_type: profile.profile_type };
      default:
        return null;
    }
  };

  const goNextStep = async () => {
    const error = validateWizardStep(wizardStep);
    setStepError(error);
    if (error) return;

    if (!leadId) {
      setStepError('Sessão expirada. Reinicie o formulário.');
      return;
    }

    const payload = stepPayload(wizardStep);
    if (!payload) {
      setStepError('Etapa inválida.');
      return;
    }

    setLoading(true);
    setStepError('');
    try {
      await saveLeadStep(leadId, wizardStep, payload);
      setProfessionOpen(false);
      setCityOpen(false);
      setBirthCalendarOpen(false);
      if (wizardStep < WIZARD_STEPS) {
        setWizardStep((s) => s + 1);
      } else {
        trackMeta('CompleteRegistration', {
          params: {
            content_name: 'Solar Bellavista',
            status: true,
          },
        });
        setView('done');
      }
    } catch (error) {
      setStepError(error instanceof Error ? error.message : 'Erro ao salvar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const goPrevStep = () => {
    if (wizardStep <= 1) return;
    setStepError('');
    setProfessionOpen(false);
    setWizardStep((s) => s - 1);
  };

  const wizardLocked = view === 'wizard';
  const canCloseModal = view !== 'wizard';

  const selectChip = <K extends keyof ProfileState>(field: K, value: ProfileState[K]) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setStepError('');
  };

  const selectCity = (option: BrazilianCity) => {
    setProfile((prev) => ({ ...prev, current_city: option.city, uf: option.uf }));
    setCityOpen(false);
    setCityHighlight(0);
    setStepError('');
  };

  const handleCityInput = (value: string) => {
    setProfile((prev) => ({ ...prev, current_city: value, uf: '' }));
    setCityOpen(true);
    setCityHighlight(0);
    setStepError('');
  };

  const openBirthCalendar = () => {
    const iso = parseBirthDateBR(profile.birth_date);
    if (iso) {
      const [y, m] = iso.split('-').map(Number);
      setBirthCalendarMonth(new Date(y, m - 1, 1));
    }
    setBirthCalendarOpen((open) => !open);
  };

  const selectBirthDay = (day: number) => {
    const next = formatBirthFromParts(day, birthCalendarMonth.getMonth(), birthCalendarMonth.getFullYear());
    selectChip('birth_date', next);
    setBirthCalendarOpen(false);
  };

  const birthCalendarCells = getBirthCalendarCells(birthCalendarMonth);
  const selectedBirthIso = parseBirthDateBR(profile.birth_date);
  const birthMonthLabel = birthCalendarMonth.toLocaleDateString('pt-BR', {
    month: 'long',
  });
  const birthYears = birthYearOptions();
  const progress = (wizardStep / WIZARD_STEPS) * 100;

  return (
    <section
      ref={sectionRef}
      id="interesse"
      aria-labelledby="cta-heading"
      className="section-padding cta"
    >
      <div className="container">
        <div className="cta__hero">
          <span className="cta__badge" data-reveal="eyebrow">Fale com um especialista</span>

          <h2 id="cta-heading" className="cta__title" data-reveal="heading">
            Pronto para realizar o seu sonho?
          </h2>

          <p className="cta__text" data-reveal="text">
            Clique no botão para informar nome, e-mail e telefone e seguir com a pesquisa rápida de perfil e preferências.
          </p>

          <button type="button" className="cta__open" data-reveal="extras" onClick={openForm}>
            Receber condições exclusivas
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className={`cta-modal${wizardLocked ? ' is-locked' : ''}`}
        aria-labelledby={titleId}
        onCancel={(e) => {
          e.preventDefault();
          if (canCloseModal) closeForm();
        }}
        onClick={(e) => {
          if (canCloseModal && e.target === dialogRef.current) closeForm();
        }}
      >
        <div className="cta-modal__panel">
          {canCloseModal && (
            <button type="button" className="cta-modal__close" onClick={closeForm} aria-label="Fechar formulário">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {view === 'basic' && (
            <form onSubmit={handleBasicSubmit} noValidate aria-label="Formulário de interesse no Solar Bellavista">
              <header className="cta-modal__head">
                <p className="cta-modal__eyebrow">Solar Bellavista</p>
                <h3 id={titleId}>Receber condições exclusivas</h3>
                <p>Preencha seus dados e nossa equipe retorna com as melhores condições.</p>
              </header>

              <div className="cta-modal__fields">
                <div className="cta-modal__field">
                  <label htmlFor="field-nome">
                    Nome completo <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="field-nome"
                    type="text"
                    name="nome"
                    autoComplete="name"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.nome}
                    aria-describedby={errors.nome ? 'err-nome' : undefined}
                    value={form.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    onBlur={() => handleBlur('nome')}
                    placeholder="Seu nome"
                  />
                  {errors.nome && touched.nome && (
                    <p id="err-nome" role="alert">
                      {errors.nome}
                    </p>
                  )}
                </div>

                <div className="cta-modal__field">
                  <label htmlFor="field-email">
                    E-mail <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="field-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'err-email' : undefined}
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="seu@email.com"
                    inputMode="email"
                  />
                  {errors.email && touched.email && (
                    <p id="err-email" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="cta-modal__field">
                  <label htmlFor="field-telefone">
                    Telefone <span aria-hidden="true">*</span>
                  </label>
                  <div className={`cta-modal__phone${phoneCountryOpen ? ' is-open' : ''}`}>
                    <div className="cta-modal__country">
                      <button
                        type="button"
                        className="cta-modal__country-btn"
                        aria-label={`País: ${phoneCountry.name}. Alterar DDI.`}
                        aria-haspopup="listbox"
                        aria-expanded={phoneCountryOpen}
                        aria-controls={phoneCountryListId}
                        onClick={() => setPhoneCountryOpen((open) => !open)}
                      >
                        <img
                          className="cta-modal__flag"
                          src={getCountryFlagUrl(phoneCountry.iso)}
                          alt=""
                          width={22}
                          height={16}
                          loading="lazy"
                          decoding="async"
                        />
                        <span className="cta-modal__dial">+{phoneCountry.dial}</span>
                        <span className="cta-modal__caret" aria-hidden="true">
                          ▾
                        </span>
                      </button>
                      {phoneCountryOpen && (
                        <ul id={phoneCountryListId} className="cta-modal__country-list" role="listbox">
                          {PHONE_COUNTRIES.map((country) => (
                            <li key={country.iso} role="option" aria-selected={country.iso === phoneCountryIso}>
                              <button
                                type="button"
                                className={`cta-modal__country-item${country.iso === phoneCountryIso ? ' is-active' : ''}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectPhoneCountry(country.iso)}
                              >
                                <img
                                  className="cta-modal__flag"
                                  src={getCountryFlagUrl(country.iso)}
                                  alt=""
                                  width={22}
                                  height={16}
                                  loading="lazy"
                                  decoding="async"
                                />
                                <span className="cta-modal__country-name">{country.name}</span>
                                <span className="cta-modal__country-dial">+{country.dial}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <input
                      id="field-telefone"
                      type="tel"
                      name="telefone"
                      autoComplete="tel-national"
                      required
                      aria-required="true"
                      aria-invalid={!!errors.telefone}
                      aria-describedby={errors.telefone ? 'err-telefone' : undefined}
                      value={form.telefone}
                      onChange={(e) => handleChange('telefone', e.target.value)}
                      onFocus={() => setPhoneCountryOpen(false)}
                      onBlur={() => handleBlur('telefone')}
                      placeholder={phoneCountry.placeholder}
                      inputMode="numeric"
                    />
                  </div>
                  {errors.telefone && touched.telefone && (
                    <p id="err-telefone" role="alert">
                      {errors.telefone}
                    </p>
                  )}
                </div>
              </div>

              {submitError && (
                <p className="cta-modal__submit-error" role="alert">
                  {submitError}
                </p>
              )}

              <button type="submit" className="cta__submit" disabled={loading} aria-busy={loading}>
                {loading ? 'Enviando...' : 'Quero saber mais'}
              </button>

              <p className="cta-modal__note">Seus dados estão seguros. Não fazemos spam.</p>
            </form>
          )}

          {view === 'quase-la' && (
            <div className="cta-modal__quase">
              <p className="cta-modal__eyebrow">Quase lá</p>
              <h3 id={titleId}>Recebemos o seu contato!</h3>
              <p>
                Em breve um especialista do Solar Bellavista pode te chamar. Quer acelerar?
                Complete seu perfil em menos de 1 minuto.
              </p>
              <button
                type="button"
                className="cta__submit"
                onClick={() => {
                  setWizardStep(1);
                  setStepError('');
                  setView('wizard');
                }}
              >
                Completar meu cadastro
              </button>
              <a
                className="cta-modal__whatsapp"
                href="https://link.genesisempreendimentos.com.br/solar-bellavista-whatsapp"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (leadId) void markWhatsappClicked(leadId);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.5 3.5A11.8 11.8 0 0 0 12.05 0C5.5 0 .2 5.3.2 11.85c0 2.1.55 4.15 1.6 5.95L0 24l6.35-1.65a11.8 11.8 0 0 0 5.7 1.45h.05c6.55 0 11.85-5.3 11.85-11.85 0-3.15-1.25-6.15-3.45-8.45ZM12.05 21.7h-.04a9.8 9.8 0 0 1-5-1.35l-.36-.2-3.75.98 1-3.65-.24-.38a9.8 9.8 0 0 1-1.5-5.25c0-5.4 4.4-9.8 9.85-9.8a9.75 9.75 0 0 1 9.8 9.8c0 5.4-4.4 9.85-9.76 9.85Zm5.4-7.35c-.3-.15-1.75-.85-2.02-.95-.27-.1-.47-.15-.67.15-.2.3-.77.95-.95 1.15-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.48-1.78-1.66-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54 1.9.82 2.65.89 3.6.75.58-.09 1.75-.72 2-1.4.25-.7.25-1.28.17-1.4-.07-.12-.27-.2-.57-.35Z" />
                </svg>
                Falar no WhatsApp
              </a>
            </div>
          )}

          {view === 'wizard' && (
            <div className="cta-modal__wizard">
              <header className="cta-modal__head cta-modal__head--wizard">
                <p className="cta-modal__eyebrow">
                  Etapa {wizardStep} de {WIZARD_STEPS}
                </p>
                <div className="cta-modal__progress" aria-hidden="true">
                  <span style={{ width: `${progress}%` }} />
                </div>
                <h3 id={titleId}>
                  {wizardStep === 1 && 'Qual seu estado civil?'}
                  {wizardStep === 2 && 'Você tem filhos?'}
                  {wizardStep === 3 && 'Qual sua profissão?'}
                  {wizardStep === 4 && 'Qual é a sua renda familiar mensal?'}
                  {wizardStep === 5 && 'Qual o seu gênero?'}
                  {wizardStep === 6 && 'Em qual cidade você mora?'}
                  {wizardStep === 7 && 'Qual sua data de nascimento?'}
                  {wizardStep === 8 && 'Qual seu perfil?'}
                </h3>
              </header>

              <div className="cta-modal__step">
                {wizardStep === 1 && (
                  <div className="cta-modal__chips">
                    {RELATIONSHIP_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`cta-modal__chip${profile.relationship_status === option ? ' is-active' : ''}`}
                        onClick={() => selectChip('relationship_status', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="cta-modal__chips">
                    {CHILDREN_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`cta-modal__chip${profile.children_status === option ? ' is-active' : ''}`}
                        onClick={() => selectChip('children_status', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="cta-modal__field cta-modal__combobox">
                    <label htmlFor="field-profession" className="sr-only">
                      Profissão
                    </label>
                    <input
                      id="field-profession"
                      type="text"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-expanded={professionOpen}
                      aria-controls={professionListId}
                      aria-activedescendant={
                        professionOpen && professionSuggestions[professionHighlight]
                          ? `${professionListId}-${professionHighlight}`
                          : undefined
                      }
                      value={profile.profession}
                      onChange={(e) => {
                        selectChip('profession', e.target.value);
                        setProfessionOpen(true);
                        setProfessionHighlight(0);
                      }}
                      onFocus={() => setProfessionOpen(true)}
                      onBlur={() => {
                        window.setTimeout(() => setProfessionOpen(false), 120);
                      }}
                      onKeyDown={(e) => {
                        if (!professionOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                          setProfessionOpen(true);
                          return;
                        }
                        if (!professionSuggestions.length) return;

                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setProfessionHighlight((i) => (i + 1) % professionSuggestions.length);
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setProfessionHighlight(
                            (i) => (i - 1 + professionSuggestions.length) % professionSuggestions.length
                          );
                        } else if (e.key === 'Enter' && professionOpen) {
                          e.preventDefault();
                          const chosen = professionSuggestions[professionHighlight];
                          if (chosen) {
                            selectChip('profession', chosen);
                            setProfessionOpen(false);
                          }
                        } else if (e.key === 'Escape') {
                          setProfessionOpen(false);
                        }
                      }}
                      placeholder="Digite para buscar..."
                      autoComplete="off"
                    />
                    {professionOpen && professionSuggestions.length > 0 && (
                      <ul id={professionListId} className="cta-modal__suggest" role="listbox">
                        {professionSuggestions.map((option, index) => (
                          <li key={option} role="option" aria-selected={index === professionHighlight}>
                            <button
                              type="button"
                              id={`${professionListId}-${index}`}
                              className={`cta-modal__suggest-item${index === professionHighlight ? ' is-active' : ''}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                selectChip('profession', option);
                                setProfessionOpen(false);
                              }}
                              onMouseEnter={() => setProfessionHighlight(index)}
                            >
                              {option}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="cta-modal__chips">
                    {INCOME_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`cta-modal__chip${profile.monthly_income === option ? ' is-active' : ''}`}
                        onClick={() => selectChip('monthly_income', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {wizardStep === 5 && (
                  <div className="cta-modal__chips">
                    {GENDER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`cta-modal__chip${profile.sexo === option.value ? ' is-active' : ''}`}
                        onClick={() => selectChip('sexo', option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {wizardStep === 6 && (
                  <div className="cta-modal__field cta-modal__combobox">
                    <label htmlFor="field-city" className="sr-only">
                      Cidade
                    </label>
                    <div className={`cta-modal__city${profile.uf ? ' has-uf' : ''}`}>
                      <input
                        id="field-city"
                        type="text"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={cityOpen}
                        aria-controls={cityListId}
                        aria-activedescendant={
                          cityOpen && citySuggestions[cityHighlight]
                            ? `${cityListId}-${cityHighlight}`
                            : undefined
                        }
                        value={profile.current_city}
                        onChange={(e) => handleCityInput(e.target.value)}
                        onFocus={() => setCityOpen(true)}
                        onBlur={() => {
                          window.setTimeout(() => setCityOpen(false), 120);
                        }}
                        onKeyDown={(e) => {
                          if (!cityOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                            setCityOpen(true);
                            return;
                          }
                          if (!citySuggestions.length) return;

                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setCityHighlight((i) => (i + 1) % citySuggestions.length);
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setCityHighlight(
                              (i) => (i - 1 + citySuggestions.length) % citySuggestions.length
                            );
                          } else if (e.key === 'Enter' && cityOpen) {
                            e.preventDefault();
                            const chosen = citySuggestions[cityHighlight];
                            if (chosen) selectCity(chosen);
                          } else if (e.key === 'Escape') {
                            setCityOpen(false);
                          }
                        }}
                        placeholder="Digite para buscar..."
                        autoComplete="off"
                      />
                      {profile.uf && (
                        <span className="cta-modal__uf-badge" aria-label={`UF ${profile.uf}`}>
                          {profile.uf}
                        </span>
                      )}
                    </div>
                    {cityOpen && citySuggestions.length > 0 && (
                      <ul id={cityListId} className="cta-modal__suggest" role="listbox">
                        {citySuggestions.map((option, index) => (
                          <li
                            key={`${option.city}-${option.uf}`}
                            role="option"
                            aria-selected={index === cityHighlight}
                          >
                            <button
                              type="button"
                              id={`${cityListId}-${index}`}
                              className={`cta-modal__suggest-item cta-modal__suggest-item--city${index === cityHighlight ? ' is-active' : ''}`}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => selectCity(option)}
                              onMouseEnter={() => setCityHighlight(index)}
                            >
                              <span>{option.city}</span>
                              <span className="cta-modal__uf-badge">{option.uf}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {wizardStep === 7 && (
                  <div className={`cta-modal__field cta-modal__birth${birthCalendarOpen ? ' is-open' : ''}`}>
                    <label htmlFor="field-birth" className="sr-only">
                      Data de nascimento
                    </label>
                    <div className="cta-modal__birth-field">
                      <input
                        id="field-birth"
                        type="text"
                        inputMode="numeric"
                        value={profile.birth_date}
                        onChange={(e) => {
                          selectChip('birth_date', maskBirthDate(e.target.value));
                          setBirthCalendarOpen(false);
                        }}
                        onFocus={() => setBirthCalendarOpen(false)}
                        placeholder="Selecione seu aniversário"
                        autoComplete="bday"
                        maxLength={10}
                      />
                      <button
                        type="button"
                        className="cta-modal__birth-trigger"
                        aria-label="Abrir calendário"
                        aria-expanded={birthCalendarOpen}
                        onClick={openBirthCalendar}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
                          <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {birthCalendarOpen && (
                      <div className="cta-modal__calendar" role="dialog" aria-label="Calendário de nascimento">
                        <div className="cta-modal__calendar-head">
                          <button
                            type="button"
                            className="cta-modal__calendar-nav"
                            aria-label="Mês anterior"
                            onClick={() =>
                              setBirthCalendarMonth(
                                (month) => new Date(month.getFullYear(), month.getMonth() - 1, 1)
                              )
                            }
                          >
                            ‹
                          </button>
                          <div className="cta-modal__calendar-title">
                            <span>{birthMonthLabel}</span>
                            <label className="sr-only" htmlFor="birth-year">
                              Ano
                            </label>
                            <select
                              id="birth-year"
                              value={birthCalendarMonth.getFullYear()}
                              onChange={(e) =>
                                setBirthCalendarMonth(
                                  (month) => new Date(Number(e.target.value), month.getMonth(), 1)
                                )
                              }
                            >
                              {birthYears.map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            className="cta-modal__calendar-nav"
                            aria-label="Próximo mês"
                            onClick={() =>
                              setBirthCalendarMonth(
                                (month) => new Date(month.getFullYear(), month.getMonth() + 1, 1)
                              )
                            }
                          >
                            ›
                          </button>
                        </div>

                        <div className="cta-modal__calendar-weekdays" aria-hidden="true">
                          {BIRTH_WEEKDAYS.map((day, index) => (
                            <span key={`${day}-${index}`}>{day}</span>
                          ))}
                        </div>

                        <div className="cta-modal__calendar-grid">
                          {birthCalendarCells.map((day, index) => {
                            if (!day) {
                              return <span key={`empty-${index}`} className="cta-modal__calendar-empty" />;
                            }
                            const iso = `${birthCalendarMonth.getFullYear()}-${String(birthCalendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = selectedBirthIso === iso;
                            const isFuture = new Date(`${iso}T12:00:00`).getTime() > Date.now();
                            return (
                              <button
                                key={iso}
                                type="button"
                                className={`cta-modal__calendar-day${isSelected ? ' is-selected' : ''}`}
                                disabled={isFuture}
                                onClick={() => selectBirthDay(day)}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {wizardStep === 8 && (
                  <div className="cta-modal__chips">
                    {PROFILE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`cta-modal__chip${profile.profile_type === option ? ' is-active' : ''}`}
                        onClick={() => selectChip('profile_type', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {stepError && (
                <p className="cta-modal__submit-error" role="alert">
                  {stepError}
                </p>
              )}

              <div className="cta-modal__nav">
                <button
                  type="button"
                  className="cta-modal__ghost"
                  onClick={goPrevStep}
                  disabled={loading || wizardStep <= 1}
                  aria-disabled={wizardStep <= 1}
                >
                  Voltar
                </button>
                <button type="button" className="cta__submit cta__submit--inline" onClick={goNextStep} disabled={loading}>
                  {loading ? 'Salvando...' : wizardStep === WIZARD_STEPS ? 'Finalizar' : 'Continuar'}
                </button>
              </div>
            </div>
          )}

          {view === 'done' && (
            <div className="cta-modal__success">
              <div className="cta-modal__success-icon" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 id={titleId}>Cadastro completo!</h3>
              <p>Obrigado. Nossa equipe já tem seu perfil e vai entrar em contato com condições do Solar Bellavista.</p>
              <button type="button" className="cta__submit" onClick={closeForm}>
                Fechar
              </button>
            </div>
          )}
        </div>
      </dialog>

      <style>{`
        .cta {
          background:
            radial-gradient(ellipse 70% 60% at 50% 40%, rgba(28, 146, 160, 0.28) 0%, transparent 70%),
            #013034;
          text-align: center;
        }

        .cta__hero {
          max-width: 46rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .cta__badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 2rem;
          padding: 0.45rem 1rem;
          margin-bottom: 1.5rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffd166;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .cta__title {
          margin: 0 0 1.15rem;
          max-width: 14ch;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(2rem, 4.5vw, 3.35rem);
          line-height: 1.12;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .cta__text {
          margin: 0 0 2rem;
          max-width: 40ch;
          font-size: clamp(0.95rem, 1.4vw, 1.05rem);
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.78);
        }

        .cta__open,
        .cta__submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0.95rem 1.85rem;
          border: 0;
          border-radius: 10px;
          background: #eb9c36;
          color: #1a1a1a;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .cta__open:hover,
        .cta__submit:hover:not(:disabled) {
          background: #d88928;
          transform: translateY(-1px);
        }

        .cta__submit {
          width: 100%;
          margin-top: 0.25rem;
        }

        .cta__submit--inline {
          width: auto;
          min-width: 9rem;
          margin-top: 0;
        }

        .cta__submit:disabled {
          background: #c5bfa9;
          cursor: wait;
          transform: none;
        }

        .cta-modal {
          width: min(calc(100% - 2rem), 28rem);
          max-height: none;
          margin: auto;
          padding: 0;
          border: 0;
          border-radius: 18px;
          background: transparent;
          color: #2c2f31;
          overflow: visible;
        }

        .cta-modal::backdrop {
          background: rgba(1, 48, 52, 0.72);
          backdrop-filter: blur(4px);
        }

        .cta-modal__panel {
          position: relative;
          padding: clamp(1.5rem, 4vw, 2rem);
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 28px 64px rgba(0, 0, 0, 0.28);
          animation: ctaModalIn 0.35s ease;
          overflow: visible;
        }

        @keyframes ctaModalIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .cta-modal__close {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          border: 0;
          border-radius: 999px;
          background: #f3f8f8;
          color: #013034;
          cursor: pointer;
          transition: background 0.2s ease;
          z-index: 2;
        }

        .cta-modal__close:hover {
          background: #e4eef0;
        }

        .cta-modal__head {
          margin: 0 2rem 1.5rem 0;
          text-align: left;
        }

        .cta-modal__head--wizard {
          margin-right: 2.5rem;
        }

        .cta-modal__eyebrow {
          margin: 0 0 0.55rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #19808c;
        }

        .cta-modal__head h3,
        .cta-modal__quase h3 {
          margin: 0 0 0.55rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 800;
          font-size: clamp(1.35rem, 3vw, 1.65rem);
          color: #013034;
          line-height: 1.2;
        }

        .cta-modal__head p:last-child,
        .cta-modal__quase > p {
          margin: 0;
          font-size: 0.92rem;
          line-height: 1.55;
          color: #4a5a61;
        }

        .cta-modal__fields,
        .cta-modal__step {
          display: grid;
          gap: 1.05rem;
          margin-bottom: 1.35rem;
          text-align: left;
          overflow: visible;
        }

        .cta-modal__field label:not(.sr-only) {
          display: block;
          margin-bottom: 0.4rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 600;
          font-size: 0.78rem;
          color: #373f42;
          letter-spacing: 0.03em;
        }

        .cta-modal__field label span {
          color: #dc2626;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .cta-modal__field input {
          width: 100%;
          min-height: 48px;
          padding: 0.875rem 1rem;
          border-radius: 8px;
          border: 1.5px solid #e4d7b6;
          font-size: 0.9rem;
          font-family: 'Open Sans Variable', 'Open Sans Fallback', 'Open Sans', Arial, sans-serif;
          color: #2c2f31;
          background: #ffffff;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .cta-modal__phone {
          position: relative;
          display: flex;
          align-items: stretch;
          border-radius: 8px;
          border: 1.5px solid #e4d7b6;
          background: #ffffff;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          z-index: 4;
        }

        .cta-modal__phone.is-open {
          z-index: 8;
        }

        .cta-modal__phone:focus-within {
          border-color: #1c92a0;
          box-shadow: 0 0 0 3px rgba(28, 146, 160, 0.12);
        }

        .cta-modal__country {
          position: relative;
          flex: 0 0 auto;
        }

        .cta-modal__country-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          height: 100%;
          min-height: 48px;
          padding: 0 0.7rem 0 0.75rem;
          border: 0;
          border-right: 1.5px solid #e4d7b6;
          border-radius: 8px 0 0 8px;
          background: #f3f8f8;
          color: #013034;
          cursor: pointer;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
        }

        .cta-modal__country-btn:hover {
          background: #e8f2f3;
        }

        .cta-modal__flag {
          display: block;
          width: 22px;
          height: 16px;
          object-fit: cover;
          border-radius: 2px;
          box-shadow: 0 0 0 1px rgba(1, 48, 52, 0.12);
          flex-shrink: 0;
        }

        .cta-modal__dial {
          font-size: 0.82rem;
          font-weight: 700;
        }

        .cta-modal__caret {
          font-size: 0.65rem;
          opacity: 0.65;
        }

        .cta-modal__country-list {
          position: absolute;
          bottom: calc(100% + 0.4rem);
          left: 0;
          z-index: 40;
          width: min(18.5rem, calc(100vw - 4rem));
          max-height: 14rem;
          margin: 0;
          padding: 0.35rem;
          overflow-y: auto;
          list-style: none;
          border: 1.5px solid #e4d7b6;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 14px 30px rgba(1, 48, 52, 0.14);
        }

        .cta-modal__country-item {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.55rem;
          width: 100%;
          padding: 0.65rem 0.7rem;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.84rem;
          text-align: left;
          cursor: pointer;
        }

        .cta-modal__country-item:hover,
        .cta-modal__country-item.is-active {
          background: rgba(28, 146, 160, 0.12);
        }

        .cta-modal__country-name {
          font-weight: 600;
        }

        .cta-modal__country-dial {
          color: #5b7a7b;
          font-weight: 600;
        }

        .cta-modal__phone input {
          border: 0;
          border-radius: 0 8px 8px 0;
          box-shadow: none;
        }

        .cta-modal__phone input:focus {
          box-shadow: none;
        }

        .cta-modal__field input:focus {
          border-color: #1c92a0;
          box-shadow: 0 0 0 3px rgba(28, 146, 160, 0.12);
        }

        .cta-modal__wizard {
          overflow: visible;
        }

        .cta-modal__combobox {
          position: relative;
          z-index: 6;
        }

        .cta-modal__suggest {
          position: absolute;
          top: calc(100% + 0.35rem);
          bottom: auto;
          left: 0;
          right: 0;
          z-index: 30;
          margin: 0;
          padding: 0.35rem;
          list-style: none;
          max-height: min(14rem, 42vh);
          overflow-y: auto;
          border: 1.5px solid #e4d7b6;
          border-radius: 10px;
          background: #ffffff;
          box-shadow: 0 14px 30px rgba(1, 48, 52, 0.14);
        }

        .cta-modal__suggest-item {
          display: block;
          width: 100%;
          padding: 0.7rem 0.85rem;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
        }

        .cta-modal__suggest-item:hover,
        .cta-modal__suggest-item.is-active {
          background: rgba(28, 146, 160, 0.12);
        }

        .cta-modal__suggest-item--city {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .cta-modal__city {
          position: relative;
          display: flex;
          align-items: center;
        }

        .cta-modal__city input {
          width: 100%;
        }

        .cta-modal__city.has-uf input {
          padding-right: 3.6rem;
        }

        .cta-modal__city > .cta-modal__uf-badge {
          position: absolute;
          right: 0.7rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .cta-modal__uf-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 2.1rem;
          height: 1.55rem;
          padding: 0 0.45rem;
          border-radius: 6px;
          background: #e8f2f3;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          flex-shrink: 0;
        }

        .cta-modal__field input[aria-invalid='true'],
        .cta-modal__field:has(input[aria-invalid='true']) .cta-modal__phone {
          border-color: #dc2626;
        }

        .cta-modal__hint {
          display: block;
          margin-top: 0.35rem;
          font-size: 0.72rem;
          color: #5b7a7b;
        }

        .cta-modal__birth {
          position: relative;
          z-index: 5;
        }

        .cta-modal__birth.is-open {
          z-index: 12;
        }

        .cta-modal__birth-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .cta-modal__birth-field input {
          width: 100%;
          padding-right: 3.1rem;
        }

        .cta-modal__birth-trigger {
          position: absolute;
          right: 0.45rem;
          top: 50%;
          transform: translateY(-50%);
          display: grid;
          place-items: center;
          width: 2.35rem;
          height: 2.35rem;
          border: 0;
          border-radius: 8px;
          background: #f3f8f8;
          color: #013034;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .cta-modal__birth-trigger:hover,
        .cta-modal__birth.is-open .cta-modal__birth-trigger {
          background: rgba(28, 146, 160, 0.14);
          color: #1c92a0;
        }

        .cta-modal__calendar {
          position: absolute;
          top: calc(100% + 0.45rem);
          left: 0;
          right: 0;
          z-index: 20;
          padding: 0.9rem;
          border: 1.5px solid #e4d7b6;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 16px 34px rgba(1, 48, 52, 0.16);
          animation: ctaCalendarIn 0.22s ease;
        }

        @keyframes ctaCalendarIn {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cta-modal__calendar-head {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.75rem;
        }

        .cta-modal__calendar-nav {
          display: grid;
          place-items: center;
          width: 2rem;
          height: 2rem;
          border: 0;
          border-radius: 8px;
          background: #f3f8f8;
          color: #013034;
          font-size: 1.15rem;
          line-height: 1;
          cursor: pointer;
        }

        .cta-modal__calendar-nav:hover {
          background: rgba(28, 146, 160, 0.14);
          color: #1c92a0;
        }

        .cta-modal__calendar-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          color: #013034;
          text-transform: capitalize;
        }

        .cta-modal__calendar-title select {
          min-height: 2rem;
          padding: 0.2rem 0.45rem;
          border: 1.5px solid #e4d7b6;
          border-radius: 8px;
          background: #ffffff;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.84rem;
          font-weight: 700;
          cursor: pointer;
        }

        .cta-modal__calendar-weekdays,
        .cta-modal__calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
        }

        .cta-modal__calendar-weekdays {
          margin-bottom: 0.35rem;
        }

        .cta-modal__calendar-weekdays span {
          text-align: center;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #5b7a7b;
        }

        .cta-modal__calendar-empty {
          min-height: 2.15rem;
        }

        .cta-modal__calendar-day {
          min-height: 2.15rem;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .cta-modal__calendar-day:hover:not(:disabled) {
          background: rgba(28, 146, 160, 0.12);
        }

        .cta-modal__calendar-day.is-selected {
          background: linear-gradient(135deg, #1c92a0, #eb9c36);
          color: #ffffff;
        }

        .cta-modal__calendar-day:disabled {
          opacity: 0.28;
          cursor: not-allowed;
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-modal__calendar {
            animation: none;
          }
        }

        .cta-modal__field p[role='alert'],
        .cta-modal__submit-error {
          margin: 0.35rem 0 0.85rem;
          font-size: 0.78rem;
          color: #dc2626;
          text-align: left;
        }

        .cta-modal__note {
          margin: 1rem 0 0;
          text-align: center;
          font-size: 0.72rem;
          color: #5b7a7b;
          line-height: 1.5;
        }

        .cta-modal__quase {
          display: flex;
          flex-direction: column;
          text-align: left;
          padding-top: 0.15rem;
        }

        .cta-modal__quase > p {
          margin-bottom: 1.35rem;
        }

        .cta-modal__quase .cta__submit {
          width: 100%;
        }

        .cta-modal__whatsapp {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          width: auto;
          margin: 0.85rem auto 0;
          padding: 0;
          border: 0;
          background: none;
          color: #128c7e;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease, opacity 0.2s ease;
        }

        .cta-modal__whatsapp:hover {
          color: #075e54;
          opacity: 0.85;
        }

        .cta-modal__ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0.8rem 1.25rem;
          border: 1.5px solid rgba(1, 48, 52, 0.14);
          border-radius: 10px;
          background: transparent;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .cta-modal__ghost:hover:not(:disabled) {
          background: #f3f8f8;
        }

        .cta-modal__ghost:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cta-modal__progress {
          width: 100%;
          height: 6px;
          margin: 0 0 1rem;
          border-radius: 999px;
          background: #eef4f4;
          overflow: hidden;
        }

        .cta-modal__progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #1c92a0, #eb9c36);
          transition: width 0.3s ease;
        }

        .cta-modal__chips {
          display: grid;
          gap: 0.65rem;
        }

        .cta-modal__chip {
          min-height: 48px;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e4d7b6;
          border-radius: 10px;
          background: #fff;
          color: #013034;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .cta-modal__chip:hover {
          border-color: #1c92a0;
          background: #f3f8f8;
        }

        .cta-modal__chip.is-active {
          border-color: #1c92a0;
          background: rgba(28, 146, 160, 0.12);
          color: #013034;
          box-shadow: inset 0 0 0 1px rgba(28, 146, 160, 0.25);
        }

        .cta-modal__nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .cta-modal__nav .cta-modal__ghost {
          width: auto;
          min-width: 7rem;
          margin-top: 0;
        }

        .cta-modal__success {
          text-align: center;
          padding: 1rem 0.25rem 0.25rem;
        }

        .cta-modal__success-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1.25rem;
          border-radius: 50%;
          background: rgba(28, 146, 160, 0.12);
          color: #1c92a0;
          display: grid;
          place-items: center;
        }

        .cta-modal__success h3 {
          margin: 0 0 0.75rem;
          font-family: 'Montserrat Variable', 'Montserrat Fallback', 'Montserrat', Arial, sans-serif;
          font-weight: 700;
          font-size: 1.25rem;
          color: #013034;
        }

        .cta-modal__success p {
          margin: 0 0 1.5rem;
          font-size: 0.9rem;
          color: #4a5a61;
          line-height: 1.7;
        }

        @media (prefers-reduced-motion: reduce) {
          .cta__badge,
          .cta__text,
          .cta__open {
            opacity: 1 !important;
          }

          .cta-modal__panel {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
