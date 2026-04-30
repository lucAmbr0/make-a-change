import { ZodType } from "zod";
import { ValidationError } from "../errors/ApiError";
import { RequestCtx } from "../auth/ctx";

export async function readJson(ctx: RequestCtx): Promise<unknown> {
  if (!ctx.request) {
    throw new ValidationError("No request body available", {
      error: "This service was called without an HTTP request",
    });
  }
  try {
    return await ctx.request.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }
}

export async function parseBody<T>(
  ctx: RequestCtx,
  schema: ZodType<T>,
): Promise<T> {
  const raw = await readJson(ctx);
  return schema.parse(raw);
}
