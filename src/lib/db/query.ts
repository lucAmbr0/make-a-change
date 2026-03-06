import pool from './mysql';
import { ServiceUnavailableError } from '../errors/ApiError';

export class DBError extends Error {
  code: string;
  kind: 'constraint' | 'syntax' | 'connection' | 'timeout' | 'unknown';
  original?: any;
  sqlState?: string;
  errno?: number;

  constructor(
    code: string,
    message: string,
    original?: any,
    kind: DBError['kind'] = 'unknown'
  ) {
    super(message);
    this.name = 'DBError';
    this.code = code;
    this.original = original;
    this.kind = kind;
    this.sqlState = original?.sqlState;
    this.errno = original?.errno;
    Error.captureStackTrace(this, this.constructor);
  }
}

function classifyDbErrorCode(code: string | undefined, errno?: number): DBError['kind'] {
  if (!code) return 'unknown';
  const c = String(code);

  // Connection errors
  if (
    c.includes('ECONN') ||
    c.includes('ENOTFOUND') ||
    c.includes('PROTOCOL') ||
    c === 'PROTOCOL_CONNECTION_LOST' ||
    errno === 1040 || // Too many connections
    errno === 2002 || // Can't connect
    errno === 2003 || // Can't connect to MySQL server
    errno === 2006 || // MySQL server has gone away
    errno === 2013    // Lost connection during query
  ) {
    return 'connection';
  }

  // Timeout errors
  if (c.includes('ETIMEDOUT') || errno === 1205) {
    return 'timeout';
  }

  // Constraint violations
  if (
    c === 'ER_DUP_ENTRY' ||
    c === 'ER_NO_REFERENCED_ROW' ||
    c === 'ER_NO_REFERENCED_ROW_2' ||
    c === 'ER_ROW_IS_REFERENCED' ||
    c === 'ER_ROW_IS_REFERENCED_2' ||
    c === 'ER_DATA_TOO_LONG' ||
    c === 'ER_BAD_NULL_ERROR' ||
    errno === 1062 || // Duplicate entry
    errno === 1451 || // Foreign key constraint fails on delete
    errno === 1452 || // Foreign key constraint fails on insert/update
    errno === 1406    // Data too long
  ) {
    return 'constraint';
  }

  // Syntax errors
  if (
    c.includes('SYNTAX') ||
    c === 'ER_PARSE_ERROR' ||
    c === 'ER_BAD_FIELD_ERROR' ||
    errno === 1064 || // Syntax error
    errno === 1054    // Unknown column
  ) {
    return 'syntax';
  }

  return 'unknown';
}

export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    // Validate pool is available
    if (!pool) {
      throw new ServiceUnavailableError('Database connection pool is not initialized');
    }

    const [rows] = await pool.execute<any>(sql, params);
    return rows as T[];
  } catch (err: any) {
    // Check if it's already a ServiceUnavailableError
    if (err instanceof ServiceUnavailableError) {
      throw err;
    }

    // Normalize MySQL errors into DBError
    const code = err?.code ? String(err.code) : 'UNKNOWN_DB_ERROR';
    const errno = err?.errno;
    const kind = classifyDbErrorCode(code, errno);
    const message = err?.message || 'Database error occurred';

    // For connection errors, throw ServiceUnavailableError immediately
    if (kind === 'connection' || kind === 'timeout') {
      console.error('Database connection/timeout error:', {
        code,
        errno,
        message,
      });
      throw new ServiceUnavailableError(
        'Database is temporarily unavailable. Please try again later.',
        {
          code,
          errno,
          kind,
        }
      );
    }

    // Throw DBError for all other database errors
    throw new DBError(code, message, err, kind);
  }
}