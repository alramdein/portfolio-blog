import { createHash } from "node:crypto";
import { db } from "@blog/core/db";

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;

export function isBot(userAgent: string): boolean {
  return !userAgent || BOT_UA.test(userAgent);
}

export function visitorHash(ip: string, userAgent: string, salt: string): string {
  return createHash("sha256").update(`${salt}|${ip}|${userAgent}`).digest("hex");
}

export async function recordView(slug: string, hash: string): Promise<boolean> {
  const sql = db();
  const [post] = await sql<{ id: number }[]>`
    update posts set views = views + 1 where slug = ${slug} and status = 'published' returning id
  `;
  if (!post) return false;
  await sql`
    insert into post_visitors (post_id, visitor_hash) values (${post.id}, ${hash})
    on conflict do nothing
  `;
  return true;
}
