import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/AdminHeader";
import { Editor } from "@/components/Editor";
import { requireAdmin } from "@/lib/auth";
import { getPost } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const post = await getPost(Number((await params).id));
  if (!post) notFound();

  return (
    <>
      <AdminHeader />
      <Editor
        id={post.id}
        status={post.status}
        initial={{ title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content }}
        blogUrl={process.env.NEXT_PUBLIC_BLOG_URL || "http://localhost:3000"}
      />
    </>
  );
}
