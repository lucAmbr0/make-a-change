import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

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
  role: "user" | "admin";
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

export function getTokenFromRequest(req: NextRequest | any) {
  try {
    const authHeader = req.headers?.get
      ? req.headers.get("authorization")
      : req.headers?.authorization;

    if (
      authHeader &&
      typeof authHeader === "string" &&
      authHeader.startsWith("Bearer ")
    ) {
      return authHeader.slice(7).trim();
    }
  } catch {}

  try {
    const cookie = req.cookies?.get?.(COOKIE_NAME);
    if (cookie) return cookie.value;
  } catch {}

  return null;
}

export function requireAuth(req: NextRequest | any) {
  const token = getTokenFromRequest(req);
  if (!token) throw new Error("Unauthorized");
  const payload = verifyToken(token);
  if (!payload) throw new Error("Invalid token");
  return payload;
}
