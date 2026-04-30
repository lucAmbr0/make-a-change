import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/ApiError";
import type { RequestCtx } from "./ctx";

const JWT_SECRET = process.env.JWT_SECRET || "ASSIGN_JWT_SECRET";
const COOKIE_NAME = "session_token";

export function signToken(
  payload: JWTPayload,
  expiresIn: string = "7d",
): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

interface JWTPayload {
  userId: number;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(res: any, token: string) {
  // res is Next.js Response object in API route handlers
  const cookie = `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
  // Support NextResponse (has headers or cookies helpers) and Node res.setHeader
  if (res && typeof res.headers?.set === "function") {
    // NextResponse: headers is a Headers instance
    res.headers.set("Set-Cookie", cookie);
    return;
  }
  if (res && typeof res.cookies?.set === "function") {
    // NextResponse in newer versions
    try {
      res.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
      return;
    } catch (e) {
      // fallthrough
    }
  }
  if (res && typeof res.setHeader === "function") {
    res.setHeader("Set-Cookie", cookie);
    return;
  }
  // Last resort: mutate a headers property if present
  if (res && res.headers && typeof res.headers === "object") {
    res.headers["Set-Cookie"] = cookie;
    return;
  }
}

export function clearSessionCookie(res: any) {
  const cookie = `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`;
  if (res && typeof res.headers?.set === "function") {
    res.headers.set("Set-Cookie", cookie);
    return;
  }
  if (res && typeof res.cookies?.set === "function") {
    try {
      res.cookies.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        path: "/",
        maxAge: 0,
      });
      return;
    } catch (e) {}
  }
  if (res && typeof res.setHeader === "function") {
    res.setHeader("Set-Cookie", cookie);
    return;
  }
  if (res && res.headers && typeof res.headers === "object") {
    res.headers["Set-Cookie"] = cookie;
    return;
  }
}

function getTokenFromCtx(ctx: RequestCtx): string | null {
  const authHeader = ctx.headers.get("authorization");
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const cookie = ctx.cookies.get(COOKIE_NAME);
  return cookie?.value ?? null;
}

const AUTH_CACHE_KEY = "__auth__";

export function getOptionalAuth(ctx: RequestCtx): { userId: number | null } {
  const cached = ctx.cache.get(AUTH_CACHE_KEY);
  if (cached !== undefined) return cached as { userId: number | null };

  const token = getTokenFromCtx(ctx);
  if (!token) {
    const result = { userId: null };
    ctx.cache.set(AUTH_CACHE_KEY, result);
    return result;
  }
  const payload = verifyToken(token);
  const result = { userId: payload?.userId ?? null };
  ctx.cache.set(AUTH_CACHE_KEY, result);
  return result;
}

export function requireAuthCtx(ctx: RequestCtx): { userId: number } {
  const auth = getOptionalAuth(ctx);
  if (auth.userId === null) {
    throw new UnauthorizedError("No authentication token provided");
  }
  return { userId: auth.userId };
}
