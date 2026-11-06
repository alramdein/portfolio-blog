import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

export function db(): postgres.Sql {
  if (!globalForDb.sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    // prepare: false is required by Supabase's transaction pooler (port 6543).
    globalForDb.sql = postgres(url, { prepare: false, max: 5 });
  }
  return globalForDb.sql;
}
