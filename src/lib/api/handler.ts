import { NextRequest, NextResponse } from "next/server";
import { ZodError, ZodIssue } from "zod";
import {
  ApiError,
  InternalServerError,
  ValidationError,
} from "../errors/ApiError";
import { ctxFromRequest, RequestCtx } from "../auth/ctx";

export type RouteHandler<P> = (
  ctx: RequestCtx,
  params: P,
) => Promise<unknown> | unknown;

export interface RouteOptions {
  /** Status to use for `null`/`undefined` results. Defaults to 204 (No Content). */
  emptyStatus?: number;
}

export function route<P = Record<string, never>>(
  handler: RouteHandler<P>,
  options: RouteOptions = {},
) {
  return async (
    req: NextRequest,
    routeContext?: { params: Promise<P> },
  ) => {
    try {
      const params = routeContext?.params
        ? await routeContext.params
        : ({} as P);
      const ctx = ctxFromRequest(req);
      const result = await handler(ctx, params);

      if (result instanceof NextResponse) return result;

      if (result === undefined || result === null) {
        return new NextResponse(null, { status: options.emptyStatus ?? 204 });
      }
      return NextResponse.json(result, { status: 200 });
    } catch (err) {
      return errorToResponse(err);
    }
  };
}

export function errorToResponse(err: unknown): NextResponse {
  if (err instanceof ZodError) {
    const ve = new ValidationError("Validation failed", {
      errors: err.issues.map((e: ZodIssue) => ({
        field: e.path.join("."),
        message: e.message,
        code: e.code,
      })),
    });
    return NextResponse.json(ve.toJSON(), { status: ve.statusCode });
  }
  if (err instanceof ApiError) {
    return NextResponse.json(err.toJSON(), { status: err.statusCode });
  }
  console.error("Unhandled error in route:", err);
  const ie = new InternalServerError();
  return NextResponse.json(ie.toJSON(), { status: 500 });
}
