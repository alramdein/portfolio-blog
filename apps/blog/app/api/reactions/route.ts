import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { VOTER_COOKIE, isVoterId, parseReaction, saveReaction } from "@/lib/reactions";
import { isBot } from "@/lib/views";

export async function POST(req: NextRequest) {
  const input = parseReaction(await req.json().catch(() => null));
  if (!input) return NextResponse.json({ ok: false }, { status: 400 });
  if (isBot(req.headers.get("user-agent") ?? "")) return NextResponse.json({ ok: false }, { status: 403 });

  const existing = req.cookies.get(VOTER_COOKIE)?.value;
  const voterId = isVoterId(existing) ? existing : randomUUID();

  const state = await saveReaction(voterId, input);
  if (!state) return NextResponse.json({ ok: false }, { status: 404 });

  const res = NextResponse.json({ ok: true, ...state });
  if (voterId !== existing) {
    res.cookies.set(VOTER_COOKIE, voterId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 2,
    });
  }
  return res;
}
