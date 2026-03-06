import pool from './mysql';

export class DBError extends Error {
  code: string;
  kind: 'constraint' | 'syntax' | 'connection' | 'unknown';
  original?: any;
  constructor(code: string, message: string, original?: any, kind: DBError['kind'] = 'unknown') {
    super(message);
    this.code = code;
    this.original = original;
    this.kind = kind;
  }
}

function classifyDbErrorCode(code: string | undefined): DBError['kind'] {
  if (!code) return 'unknown';
  const c = String(code);
  if (c.startsWith('ER_') || c === 'ER_DUP_ENTRY') return 'constraint';
  if (c.includes('ECONN') || c.includes('PROTOCOL')) return 'connection';
  if (c.includes('SYNTAX') || c.includes('ER_PARSE')) return 'syntax';
  return 'unknown';
}

export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const [rows] = await pool.execute<any>(sql, params);
    return rows as T[];
  } catch (err: any) {
    // Normalize MySQL errors into DBError so handlers can switch on code
    const code = err && err.code ? String(err.code) : 'UNKNOWN_DB_ERROR';
    const kind = classifyDbErrorCode(code);
    throw new DBError(code, err && err.message ? err.message : 'DB error', err, kind);
  }
}