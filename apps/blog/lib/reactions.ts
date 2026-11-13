import { db } from "@blog/core/db";

export const VOTER_COOKIE = "voter";
export const FEEDBACK_MAX = 2000;

export type Vote = 1 | -1 | 0;
export type ReactionState = { up: number; down: number; mine: Vote; feedback: string };
export type ReactionInput = { slug: string; value: Vote; feedback: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isVoterId(v: string | undefined): v is string {
  return !!v && UUID.test(v);
}

export function parseReaction(body: unknown): ReactionInput | null {
  if (!body || typeof body !== "object") return null;
  const { slug, value, feedback = "" } = body as Record<string, unknown>;
  if (typeof slug !== "string" || !slug || slug.length > 200) return null;
  if (value !== 1 && value !== -1 && value !== 0) return null;
  if (typeof feedback !== "string") return null;
  return { slug, value, feedback: feedback.trim().slice(0, FEEDBACK_MAX) };
}

export async function getReactions(postId: number, voterId: string | undefined): Promise<ReactionState> {
  const sql = db();
  const [counts] = await sql<{ up: number; down: number }[]>`
    select count(*) filter (where value = 1)::int as up, count(*) filter (where value = -1)::int as down
    from post_reactions where post_id = ${postId}
  `;
  let mine: Vote = 0;
  let feedback = "";
  if (isVoterId(voterId)) {
    const [row] = await sql<{ value: 1 | -1; feedback: string }[]>`
      select value, feedback from post_reactions where post_id = ${postId} and voter_id = ${voterId}
    `;
    if (row) ({ value: mine, feedback } = row);
  }
  return { ...counts, mine, feedback };
}

export async function saveReaction(voterId: string, input: ReactionInput): Promise<ReactionState | null> {
  const sql = db();
  const [post] = await sql<{ id: number }[]>`
    select id from posts where slug = ${input.slug} and status = 'published'
  `;
  if (!post) return null;
  if (input.value === 0) {
    await sql`delete from post_reactions where post_id = ${post.id} and voter_id = ${voterId}`;
  } else {
    await sql`
      insert into post_reactions (post_id, voter_id, value, feedback)
      values (${post.id}, ${voterId}, ${input.value}, ${input.feedback})
      on conflict (post_id, voter_id) do update
        set value = excluded.value, feedback = excluded.feedback, updated_at = now()
    `;
  }
  return getReactions(post.id, voterId);
}
