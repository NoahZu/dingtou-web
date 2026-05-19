/**
 * Cloudflare Workers D1 binding 类型声明
 * 避免安装完整的 @cloudflare/workers-types（会与 DOM 类型冲突）
 */

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  error?: string;
  meta: {
    duration: number;
    last_row_id: number;
    changes: number;
    served_by: string;
    internal_stats: unknown;
  };
}

interface D1ExecResult {
  count: number;
  duration: number;
}
