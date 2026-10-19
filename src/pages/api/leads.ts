import type { APIRoute } from 'astro';
import { EMPREENDIMENTO } from '../../data/leadForm';
import { getSql } from '../../lib/db';
import { saveLeadTracking } from '../../lib/leadTracking';

export const prerender = false;

const ORIGEM_DETALHE = 'SIE';

/** Aceita E.164 completo (+DDI + número nacional). */
function normalizePhone(value: unknown) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return '';
  return `+${digits}`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as {
      nome?: string;
      email?: string;
      telefone?: string;
      tracking?: unknown;
    };

    const nome = body.nome?.trim() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    const telefone = normalizePhone(body.telefone);

    if (nome.length < 2) {
      return json({ error: 'Informe um nome válido.' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Informe um e-mail válido.' }, 400);
    }
    if (!telefone) {
      return json({ error: 'Informe um telefone válido com DDD.' }, 400);
    }

    const sql = getSql();
    const rows = await sql`
      INSERT INTO leads (
        nome,
        email,
        telefone,
        empreendimento_interesse,
        origem_tipo,
        origem_detalhe,
        whatsapp_clicked,
        status
      )
      VALUES (
        ${nome},
        ${email},
        ${telefone},
        ${EMPREENDIMENTO},
        ${'site'},
        ${ORIGEM_DETALHE},
        false,
        ${'ativo'}
      )
      RETURNING id
    `;

    const id = rows[0]?.id as string | undefined;
    if (!id) {
      return json({ error: 'Falha ao cadastrar lead.' }, 500);
    }

    try {
      await saveLeadTracking(sql, id, body?.tracking);
    } catch (err) {
      console.error('[leads] tracking:', err instanceof Error ? err.message : err);
    }

    return json({ id });
  } catch (error) {
    console.error('[POST /api/leads]', error);
    return json({ error: 'Erro interno ao cadastrar. Tente novamente.' }, 500);
  }
};
