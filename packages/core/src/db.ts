import postgres from "postgres";

const globalForDb = globalThis as unknown as { sql?: postgres.Sql };

// Vercel's Supabase integration appends "supa=..." to POSTGRES_URL; Postgres rejects it as a startup parameter.
function connectionUrl(raw: string): string {
  const url = new URL(raw);
  url.searchParams.delete("supa");
  return url.toString();
}

export function db(): postgres.Sql {
  if (!globalForDb.sql) {
    const url = process.env.POSTGRES_URL;
    if (!url) throw new Error("POSTGRES_URL is not set");
    // prepare: false is required by Supabase's transaction pooler (port 6543).
    globalForDb.sql = postgres(connectionUrl(url), { prepare: false, max: 5 });
  }
  return globalForDb.sql;
}
