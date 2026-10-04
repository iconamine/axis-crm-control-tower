import { env } from "cloudflare:workers";

export type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      all: <T = unknown>() => Promise<{ results?: T[] }>;
      first: <T = unknown>() => Promise<T | null>;
      run: () => Promise<{ success: boolean; meta?: { last_row_id?: number } }>;
    };
    all: <T = unknown>() => Promise<{ results?: T[] }>;
    first: <T = unknown>() => Promise<T | null>;
    run: () => Promise<{ success: boolean; meta?: { last_row_id?: number } }>;
  };
  batch: (statements: unknown[]) => Promise<unknown[]>;
};

export function getDb(): D1DatabaseLike {
  return env.DB as unknown as D1DatabaseLike;
}
