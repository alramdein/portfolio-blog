"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { renderMarkdown } from "@blog/core/markdown";
import { slugify } from "@blog/core/format";
import { requireAdmin } from "@/lib/auth";
import { safeEqual, verifyPassword } from "@/lib/password";
import * as posts from "@/lib/posts";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken } from "@/lib/session";

const failedLogins = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const entry = failedLogins.get(ip);
  if (entry && entry.count >= MAX_ATTEMPTS && entry.until > Date.now()) {
    return "Too many attempts. Try again in 15 minutes.";
  }

  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  const expectedUser = process.env.ADMIN_USERNAME ?? "";
  const hash = process.env.ADMIN_PASSWORD_HASH ?? "";
  if (!expectedUser || !hash) return "Admin credentials are not configured.";

  const passwordOk = await verifyPassword(password, hash);
  if (!(safeEqual(username, expectedUser) && passwordOk)) {
    const count = (entry && entry.until > Date.now() ? entry.count : 0) + 1;
    failedLogins.set(ip, { count, until: Date.now() + LOCK_MS });
    await new Promise((r) => setTimeout(r, 600));
    return "Wrong username or password.";
  }

  failedLogins.delete(ip);
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(expectedUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function newPost() {
  await requireAdmin();
  const id = await posts.createPost();
  redirect(`/posts/${id}`);
}

export type SaveResult = { ok: true; message: string; slug?: string } | { ok: false; message: string };

function clean(input: posts.PostInput): posts.PostInput {
  const slugSource = input.slug && !input.slug.startsWith("untitled-") ? input.slug : input.title;
  return {
    title: input.title.trim(),
    slug: slugify(slugSource) || input.slug || `post-${Date.now().toString(36)}`,
    excerpt: input.excerpt.trim(),
    content: input.content,
  };
}

async function run(fn: () => Promise<void>, message: string, slug?: string): Promise<SaveResult> {
  await requireAdmin();
  try {
    await fn();
    revalidatePath("/", "layout");
    return { ok: true, message, slug };
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return { ok: false, message: "That slug is already used by another post." };
    throw e;
  }
}

export async function saveDraft(id: number, input: posts.PostInput) {
  const data = clean(input);
  return run(() => posts.savePost(id, data).then(() => {}), "Saved", data.slug);
}

export async function publish(id: number, input: posts.PostInput) {
  const data = clean(input);
  return run(() => posts.publishPost(id, data), "Published", data.slug);
}

export async function unpublish(id: number) {
  return run(() => posts.unpublishPost(id), "Moved back to drafts");
}

export async function removePost(id: number) {
  await requireAdmin();
  await posts.deletePost(id);
  redirect("/");
}

export async function restore(postId: number, versionId: number) {
  await requireAdmin();
  await posts.restoreVersion(postId, versionId);
  redirect(`/posts/${postId}`);
}

export async function preview(markdown: string): Promise<string> {
  await requireAdmin();
  return renderMarkdown(markdown);
}
