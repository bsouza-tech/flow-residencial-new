import { trackMeta } from '../lib/metaPixel';
import { readTracking } from '../lib/leadsApi';

type FormsEventDetail = {
  type?: string;
  reason?: string;
};

type GenesisFormApi = {
  init: (options: {
    formId: string;
    apiBase: string;
    preview: boolean;
    silentUnavailable: boolean;
    getTracking: () => unknown;
  }) => void;
  isReady: () => boolean;
  open: () => boolean;
};

declare global {
  interface Window {
    GenesisForm?: GenesisFormApi;
  }
}

let scriptState: 'idle' | 'failed' | 'loaded' = 'idle';
let pendingReason = '';

function onFormsEvent(event: Event) {
  const detail = (event as CustomEvent<FormsEventDetail>).detail;
  if (!detail) return;
  if (detail.type === 'unavailable' && detail.reason) pendingReason = detail.reason;
  if (import.meta.env.PROD && detail.type === 'lead_created') {
    trackMeta('Lead', {
      params: {
        content_name: 'Flow Residencial',
        content_category: 'formulario_basico',
      },
    });
  }
  if (import.meta.env.PROD && detail.type === 'completed') {
    trackMeta('CompleteRegistration', {
      params: {
        content_name: 'Flow Residencial',
        status: true,
      },
    });
  }
}

function fallbackReason(): string {
  if (scriptState === 'failed') return 'script_nao_carregou';
  if (!window.GenesisForm?.open) return 'widget_ausente';
  return pendingReason || 'widget_ausente';
}

function onClickCapture(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest('[data-abrir-formulario]')) return;
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;

  pendingReason = '';
  const api = window.GenesisForm;
  if (!api?.isReady || !api.open) {
    console.warn('[formulario] fallback', fallbackReason());
    return;
  }

  if (api.isReady() && api.open()) {
    event.preventDefault();
    console.info('[formulario] widget aberto');
    return;
  }

  if (!api.isReady()) api.open();
  console.warn('[formulario] fallback', pendingReason || fallbackReason());
  pendingReason = '';
}

function loadWidget(base: string) {
  const script = document.createElement('script');
  script.src = `${base}/widget/v1/widget.js`;
  script.async = true;
  script.onload = () => {
    const api = window.GenesisForm;
    if (!api || typeof api.init !== 'function') {
      scriptState = 'failed';
      return;
    }
    api.init({
      formId: import.meta.env.PUBLIC_FORMS_ID,
      apiBase: base,
      preview: import.meta.env.PUBLIC_FORMS_REAL !== '1',
      silentUnavailable: true,
      getTracking: () => readTracking(),
    });
    scriptState = 'loaded';
  };
  script.onerror = () => {
    scriptState = 'failed';
  };
  document.body.appendChild(script);
}

export function installFormularioGlobal() {
  if (import.meta.env.PUBLIC_FORMULARIO_GLOBAL !== '1') return;

  const base = String(import.meta.env.PUBLIC_FORMS_WIDGET_BASE || '').replace(/\/$/, '');
  window.addEventListener('genese-forms:event', onFormsEvent);
  document.addEventListener('click', onClickCapture, true);

  const start = () => loadWidget(base);
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
