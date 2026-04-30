import { headers as nextHeaders, cookies as nextCookies } from "next/headers";
import type { NextRequest } from "next/server";

export interface RequestCtx {
  headers: Headers | { get(name: string): string | null | undefined };
  cookies: { get(name: string): { value: string } | undefined };
  cache: Map<string, unknown>;
  request?: NextRequest;
}

export function ctxFromRequest(req: NextRequest): RequestCtx {
  return {
    headers: req.headers,
    cookies: req.cookies,
    cache: new Map(),
    request: req,
  };
}

export async function getServerCtx(): Promise<RequestCtx> {
  const h = await nextHeaders();
  const c = await nextCookies();
  return {
    headers: h,
    cookies: c,
    cache: new Map(),
  };
}
