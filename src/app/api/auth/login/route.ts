import { NextResponse } from "next/server";
import { userAuthenticationInput } from "@/lib/schemas/users";
import { loginUser } from "@/lib/services/userService";
import { setSessionCookie } from "@/lib/auth/auth";
import { route } from "@/lib/api/handler";
import { parseBody } from "@/lib/api/body";

export const POST = route(async (ctx) => {
  const input = await parseBody(ctx, userAuthenticationInput);
  const user = await loginUser(input);

  const response = NextResponse.json({ id: user.id });
  if (user.session_token) setSessionCookie(response, user.session_token);
  return response;
});
