import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/auth";
import { route } from "@/lib/api/handler";

export const POST = route(async () => {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
});
