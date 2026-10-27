import { config } from 'dotenv';

config();

function getConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausente');
  }
  return { url, key };
}

function authHeaders(prefer?: string): HeadersInit {
  const { key } = getConfig();
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function throwIfNotOk(res: Response, context: string) {
  if (res.ok) return;
  const body = await res.text().catch(() => '');
  throw new Error(`${context}: ${res.status} ${body}`);
}

export async function supabaseInsert(
  table: string,
  row: Record<string, unknown>,
): Promise<void> {
  const { url } = getConfig();
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST',
    headers: authHeaders('return=minimal'),
    body: JSON.stringify(row),
  });
  await throwIfNotOk(res, `POST ${table}`);
}

export async function supabaseUpdateById(
  table: string,
  id: string,
  patch: Record<string, unknown>,
  filtro?: string,
): Promise<void> {
  const { url } = getConfig();
  let qs = `id=eq.${encodeURIComponent(id)}`;
  if (filtro) qs += `&${filtro}`;
  const res = await fetch(`${url}/rest/v1/${table}?${qs}`, {
    method: 'PATCH',
    headers: authHeaders('return=minimal'),
    body: JSON.stringify(patch),
  });
  await throwIfNotOk(res, `PATCH ${table}`);
}

export async function supabaseSelect<T>(
  table: string,
  query: string,
): Promise<T[]> {
  const { url } = getConfig();
  const qs = query.startsWith('?') ? query.slice(1) : query;
  const res = await fetch(`${url}/rest/v1/${table}?${qs}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  await throwIfNotOk(res, `GET ${table}`);
  return (await res.json()) as T[];
}

export async function supabaseRpc(
  funcao: string,
  params: Record<string, unknown>,
): Promise<void> {
  const { url } = getConfig();
  const res = await fetch(`${url}/rest/v1/rpc/${funcao}`, {
    method: 'POST',
    headers: authHeaders('return=minimal'),
    body: JSON.stringify(params),
  });
  await throwIfNotOk(res, `RPC ${funcao}`);
}
