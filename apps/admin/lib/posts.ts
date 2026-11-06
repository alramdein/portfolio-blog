import { db } from "@blog/core/db";

export type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  published_version_id: number | null;
  published_at: Date | null;
  last_published_at: Date | null;
  views: number;
  created_at: Date;
  updated_at: Date;
};

export type PostListItem = PostRow & { unique_views: number; has_unpublished_changes: boolean };

export type Version = { id: number; post_id: number; title: string; excerpt: string; content: string; created_at: Date };

export type PostInput = { title: string; slug: string; excerpt: string; content: string };

export async function listPosts() {
  return db()<PostListItem[]>`
    select p.*, p.views::int as views,
      (select count(*)::int from post_visitors pv where pv.post_id = p.id) as unique_views,
      (p.status = 'published' and (v.title, v.excerpt, v.content) is distinct from (p.title, p.excerpt, p.content)) as has_unpublished_changes
    from posts p left join post_versions v on v.id = p.published_version_id
    order by p.updated_at desc
  `;
}

export async function getPost(id: number): Promise<PostRow | undefined> {
  const [post] = await db()<PostRow[]>`select *, views::int as views from posts where id = ${id}`;
  return post;
}

export async function listVersions(postId: number) {
  return db()<Version[]>`select * from post_versions where post_id = ${postId} order by created_at desc, id desc`;
}

export async function createPost(): Promise<number> {
  const slug = `untitled-${Date.now().toString(36)}`;
  const [row] = await db()<{ id: number }[]>`insert into posts (slug) values (${slug}) returning id`;
  return row.id;
}

/** Saves the working copy and snapshots it as a new version when it changed. Returns the latest version id. */
export async function savePost(id: number, input: PostInput): Promise<number> {
  return db().begin(async (sql) => {
    await sql`
      update posts set title = ${input.title}, slug = ${input.slug}, excerpt = ${input.excerpt},
        content = ${input.content}, updated_at = now()
      where id = ${id}
    `;
    const [latest] = await sql<Version[]>`
      select * from post_versions where post_id = ${id} order by created_at desc, id desc limit 1
    `;
    if (latest && latest.title === input.title && latest.excerpt === input.excerpt && latest.content === input.content) {
      return latest.id;
    }
    const [v] = await sql<{ id: number }[]>`
      insert into post_versions (post_id, title, excerpt, content)
      values (${id}, ${input.title}, ${input.excerpt}, ${input.content}) returning id
    `;
    return v.id;
  });
}

export async function publishPost(id: number, input: PostInput): Promise<void> {
  const versionId = await savePost(id, input);
  await db()`
    update posts set status = 'published', published_version_id = ${versionId},
      published_at = coalesce(published_at, now()), last_published_at = now()
    where id = ${id}
  `;
}

export async function unpublishPost(id: number): Promise<void> {
  await db()`update posts set status = 'draft' where id = ${id}`;
}

export async function deletePost(id: number): Promise<void> {
  await db()`delete from posts where id = ${id}`;
}

export async function restoreVersion(postId: number, versionId: number): Promise<void> {
  await db()`
    update posts p set title = v.title, excerpt = v.excerpt, content = v.content, updated_at = now()
    from post_versions v where v.id = ${versionId} and v.post_id = ${postId} and p.id = ${postId}
  `;
}
