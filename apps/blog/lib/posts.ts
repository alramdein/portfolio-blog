import { db } from "@blog/core/db";

export type PublishedPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  published_at: Date;
  last_published_at: Date;
  views: number;
  unique_views: number;
};

export async function listPublished() {
  return db()<Omit<PublishedPost, "unique_views">[]>`
    select p.id, p.slug, v.title, v.excerpt, v.content, p.published_at, p.last_published_at, p.views::int as views
    from posts p join post_versions v on v.id = p.published_version_id
    where p.status = 'published'
    order by p.published_at desc
  `;
}

export async function getPublished(slug: string): Promise<PublishedPost | undefined> {
  const [post] = await db()<PublishedPost[]>`
    select p.id, p.slug, v.title, v.excerpt, v.content, p.published_at, p.last_published_at, p.views::int as views,
      (select count(*)::int from post_visitors pv where pv.post_id = p.id) as unique_views
    from posts p join post_versions v on v.id = p.published_version_id
    where p.status = 'published' and p.slug = ${slug}
  `;
  return post;
}
