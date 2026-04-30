import { NextResponse } from "next/server";
import { loginUser } from "@/lib/services/userService";
import { setSessionCookie } from "@/lib/auth/auth";
import { route } from "@/lib/api/handler";

export const GET = route(async (ctx) => {
  const user = await loginUser({
    email: "alice1@example.com",
    password: "Password1",
  });

  if (!ctx.request) {
    throw new Error("Missing request URL for redirect");
  }
  const response = NextResponse.redirect(new URL("/", ctx.request.url));
  if (user.session_token) setSessionCookie(response, user.session_token);
  return response;
});
