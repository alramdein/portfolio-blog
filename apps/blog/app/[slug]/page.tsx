import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Article } from "@blog/core/client";
import { formatDate, readingMinutes } from "@blog/core/format";
import { renderMarkdown } from "@blog/core/markdown";
import { PostMeta } from "@/components/PostMeta";
import { Reactions } from "@/components/Reactions";
import { ViewTracker } from "@/components/ViewTracker";
import { getPublished } from "@/lib/posts";
import { VOTER_COOKIE, getReactions } from "@/lib/reactions";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = await getPublished((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt || undefined, publishedTime: new Date(post.published_at).toISOString() },
  };
}

// Republishing within this window counts as a fix, not an update.
const UPDATE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export default async function PostPage({ params }: Params) {
  const post = await getPublished((await params).slug);
  if (!post) notFound();

  const [html, reactions] = await Promise.all([
    renderMarkdown(post.content),
    getReactions(post.id, (await cookies()).get(VOTER_COOKIE)?.value),
  ]);
  const updated = new Date(post.last_published_at).getTime() - new Date(post.published_at).getTime() > UPDATE_THRESHOLD_MS;

  return (
    <article className="post">
      <header className="post-header">
        <PostMeta
          published={formatDate(post.published_at)}
          publishedFull={formatDate(post.published_at, true)}
          updated={updated ? formatDate(post.last_published_at) : null}
          updatedFull={updated ? formatDate(post.last_published_at, true) : null}
          minutes={readingMinutes(post.content)}
          views={post.views}
          uniqueViews={post.unique_views}
        />
        <h1>{post.title}</h1>
        {post.excerpt && <p className="post-lede">{post.excerpt}</p>}
      </header>
      <Article html={html} />
      <Reactions slug={post.slug} initial={reactions} />
      <ViewTracker slug={post.slug} />
    </article>
  );
}
