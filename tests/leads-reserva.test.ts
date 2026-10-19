import assert from 'node:assert/strict';
import { after, before, mock, test } from 'node:test';

type Query = { sql: string; values: unknown[] };

const queries: Query[] = [];
const state: { mode: 'ok' | 'empty' | 'throw' } = { mode: 'ok' };

function sqlTag(strings: TemplateStringsArray, ...values: unknown[]) {
  const sql = strings.join('?');
  queries.push({ sql, values });
  if (state.mode === 'throw') return Promise.reject(new Error('db'));
  if (sql.includes('INSERT') && state.mode === 'empty') return Promise.resolve([]);
  return Promise.resolve([{ id: '11111111-1111-4111-8111-111111111111' }]);
}

mock.module('../src/lib/db.ts', {
  namedExports: {
    getSql: () => sqlTag,
  },
});

const { POST } = await import('../src/pages/api/leads.ts');
const { PATCH } = await import('../src/pages/api/leads/[id].ts');

const LEAD_ID = '11111111-1111-4111-8111-111111111111';

function post(body: unknown) {
  return POST({
    request: new Request('http://local/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  } as never);
}

function patch(body: unknown) {
  return PATCH({
    params: { id: LEAD_ID },
    request: new Request(`http://local/api/leads/${LEAD_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  } as never);
}

before(() => {
  queries.length = 0;
  state.mode = 'ok';
});

after(() => {
  mock.restoreAll();
});

test('INSERT grava site, SIE e Flow Residencial sem origem_empreendimento_interesse', async () => {
  queries.length = 0;
  state.mode = 'ok';
  const res = await post({
    nome: 'Ana Silva',
    email: 'ANA@example.com',
    telefone: '+5521999999999',
    tracking: null,
  });
  const data = (await res.json()) as { id?: string };
  assert.equal(res.status, 200);
  assert.equal(data.id, LEAD_ID);

  const insert = queries.find((query) => query.sql.includes('INSERT INTO leads'));
  assert.ok(insert);
  assert.match(insert.sql, /origem_tipo/);
  assert.match(insert.sql, /origem_detalhe/);
  assert.match(insert.sql, /empreendimento_interesse/);
  assert.equal(insert.sql.includes('origem_empreendimento_interesse'), false);
  assert.deepEqual(insert.values.slice(0, 3), ['Ana Silva', 'ana@example.com', '+5521999999999']);
  assert.equal(insert.values[3], 'Flow Residencial');
  assert.equal(insert.values[4], 'site');
  assert.equal(insert.values[5], 'SIE');
  assert.match(insert.sql, /,\s*false,/);
  assert.equal(insert.values[6], 'ativo');
});

test('INSERT sem id devolve 500', async () => {
  queries.length = 0;
  state.mode = 'empty';
  const res = await post({
    nome: 'Ana Silva',
    email: 'ana@example.com',
    telefone: '21999999999',
  });
  const data = (await res.json()) as { error?: string };
  assert.equal(res.status, 500);
  assert.equal(data.error, 'Falha ao cadastrar lead.');
});

test('falha do banco devolve 500', async () => {
  queries.length = 0;
  state.mode = 'throw';
  const res = await post({
    nome: 'Ana Silva',
    email: 'ana@example.com',
    telefone: '21999999999',
  });
  const data = (await res.json()) as { error?: string };
  assert.equal(res.status, 500);
  assert.equal(data.error, 'Erro interno ao cadastrar. Tente novamente.');
  state.mode = 'ok';
});

test('PATCH de etapa e whatsapp_clicked seguem iguais', async () => {
  queries.length = 0;
  state.mode = 'ok';

  const whatsapp = await patch({ whatsapp_clicked: true });
  assert.equal(whatsapp.status, 200);
  const flag = queries.find((query) => query.sql.includes('whatsapp_clicked'));
  assert.ok(flag);
  assert.match(flag.sql, /whatsapp_clicked = true/);
  assert.equal(flag.values[0], LEAD_ID);
  assert.equal(flag.sql.includes('origem_empreendimento_interesse'), false);

  queries.length = 0;
  const step = await patch({ step: 1, relationship_status: 'Solteiro(a)' });
  const body = (await step.json()) as { ok?: boolean; step?: number };
  assert.equal(step.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.step, 1);
  const update = queries.find((query) => query.sql.includes('estado_civil'));
  assert.ok(update);
  assert.equal(update.values[0], 'Solteiro(a)');
  assert.equal(update.sql.includes('origem_empreendimento_interesse'), false);
});
