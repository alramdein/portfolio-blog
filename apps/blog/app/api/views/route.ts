import { NextResponse, type NextRequest } from "next/server";
import { isBot, recordView, visitorHash } from "@/lib/views";

export async function POST(req: NextRequest) {
  const { slug } = await req.json().catch(() => ({ slug: null }));
  if (typeof slug !== "string" || slug.length > 200) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ua = req.headers.get("user-agent") ?? "";
  if (isBot(ua)) return NextResponse.json({ ok: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const salt = process.env.VIEW_HASH_SALT;
  if (!salt) throw new Error("VIEW_HASH_SALT is not set");

  const ok = await recordView(slug, visitorHash(ip, ua, salt));
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
