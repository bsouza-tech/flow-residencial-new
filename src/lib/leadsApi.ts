import type { BasicLeadPayload } from '../data/leadForm';

export function readTracking() {
  try {
    const t = (window as any).GenesisTracker;
    return t && typeof t.getContext === 'function' ? t.getContext() : null;
  } catch {
    return null;
  }
}

export async function createLead(payload: BasicLeadPayload) {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, tracking: readTracking() }),
  });

  const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !data.id) {
    throw new Error(data.error || 'Não foi possível enviar seus dados. Tente novamente.');
  }
  return data.id;
}

export async function saveLeadStep(id: string, step: number, payload: Record<string, string>) {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, ...payload }),
  });

  const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Não foi possível salvar esta etapa. Tente novamente.');
  }
}

export async function markWhatsappClicked(id: string) {
  try {
    await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ whatsapp_clicked: true }),
    });
  } catch {
    // tracking best-effort — não bloqueia abertura do WhatsApp
  }
}
