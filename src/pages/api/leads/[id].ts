import type { APIRoute } from 'astro';
import {
  GENDER_OPTIONS,
  isChildrenStatus,
  isMonthlyIncome,
  isProfileType,
  isRelationshipStatus,
  isSexo,
  parseBirthDateBR,
} from '../../../data/leadForm';
import { getSql } from '../../../lib/db';

export const prerender = false;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function generoLabel(sexo: string) {
  return GENDER_OPTIONS.find((option) => option.value === sexo)?.label ?? sexo;
}

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const id = params.id ?? '';
    if (!UUID_RE.test(id)) {
      return json({ error: 'Lead inválido.' }, 400);
    }

    const body = (await request.json()) as Record<string, unknown>;
    const sql = getSql();

    if (body.whatsapp_clicked === true && body.step == null) {
      const rows = await sql`
        UPDATE leads
        SET
          whatsapp_clicked = true,
          updated_at = now()
        WHERE id = ${id}::uuid
        RETURNING id
      `;

      if (!rows[0]?.id) {
        return json({ error: 'Lead não encontrado.' }, 404);
      }
      return json({ ok: true, id: rows[0].id });
    }

    const step = Number(body.step);
    if (!Number.isInteger(step) || step < 1 || step > 8) {
      return json({ error: 'Etapa inválida.' }, 400);
    }

    let rows: Record<string, unknown>[] = [];

    switch (step) {
      case 1: {
        const value = String(body.relationship_status ?? '');
        if (!isRelationshipStatus(value)) {
          return json({ error: 'Estado civil inválido.' }, 400);
        }
        rows = await sql`
          UPDATE leads
          SET estado_civil = ${value}, updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING id
        `;
        break;
      }
      case 2: {
        const value = String(body.children_status ?? '');
        if (!isChildrenStatus(value)) {
          return json({ error: 'Opção de filhos inválida.' }, 400);
        }
        rows = await sql`
          UPDATE leads
          SET filhos = ${value}, updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING id
        `;
        break;
      }
      case 3: {
        const value = String(body.profession ?? '').trim();
        if (value.length < 2) {
          return json({ error: 'Informe sua profissão.' }, 400);
        }
        rows = await sql`
          UPDATE leads
          SET profissao = ${value}, updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING id
        `;
        break;
      }
      case 4: {
        const value = String(body.monthly_income ?? '');
        if (!isMonthlyIncome(value)) {
          return json({ error: 'Faixa de renda inválida.' }, 400);
        }
        rows = await sql`
          UPDATE leads
          SET renda_familiar = ${value}, updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING id
        `;
        break;
      }
      case 5: {
        const value = String(body.sexo ?? '');
        if (!isSexo(value)) {
          return json({ error: 'Gênero inválido.' }, 400);
        }
        const genero = generoLabel(value);
        rows = await sql`
          UPDATE leads
          SET genero = ${genero}, updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING id
        `;
        break;
      }
      case 6: {
        const value = String(body.current_city ?? '').trim();
        const uf = String(body.uf ?? '')
          .trim()
          .toUpperCase();
        if (value.length < 2) {
          return json({ error: 'Informe sua cidade.' }, 400);
        }
        if (!/^[A-Z]{2}$/.test(uf)) {
          return json({ error: 'Selecione uma cidade da lista.' }, 400);
        }
        rows = await sql`
          UPDATE leads
          SET cidade = ${value}, uf = ${uf}, updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING id
        `;
        break;
      }
      case 7: {
        const birth_date = parseBirthDateBR(String(body.birth_date ?? ''));
        if (!birth_date) {
          return json({ error: 'Data de nascimento inválida.' }, 400);
        }
        rows = await sql`
          UPDATE leads
          SET data_nascimento = ${birth_date}::date, updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING id
        `;
        break;
      }
      case 8: {
        const value = String(body.profile_type ?? '');
        if (!isProfileType(value)) {
          return json({ error: 'Perfil inválido.' }, 400);
        }
        rows = await sql`
          UPDATE leads
          SET perfil = ${value}, updated_at = now()
          WHERE id = ${id}::uuid
          RETURNING id
        `;
        break;
      }
      default:
        return json({ error: 'Etapa inválida.' }, 400);
    }

    if (!rows[0]?.id) {
      return json({ error: 'Lead não encontrado.' }, 404);
    }

    return json({ ok: true, id: rows[0].id, step });
  } catch (error) {
    console.error('[PATCH /api/leads/:id]', error);
    return json({ error: 'Erro interno ao atualizar. Tente novamente.' }, 500);
  }
};
