import { NextRequest } from "next/server";
import { requireAuth } from "../auth/auth";
import { ValidationError } from "../errors/ApiError";
import { insertMember, searchMemberOfOrganization } from "../db/members";
import { ZodError } from "zod";
import { createMemberInput, memberRowSchema } from "../schemas/members";

export async function addMember(req: NextRequest) {
  const auth = requireAuth(req);

  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  // Validate input against schema
  let input;
  try {
    input = createMemberInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  const member: memberRowSchema = await insertMember({
    organization_id: input.organization_id,
    user_id: auth.userId,
    is_moderator: input.is_moderator,
    is_owner: input.is_owner,
  });

  return member;
}

export async function getMember(userId: number, organizationId: number) {
  const member: memberRowSchema | null = await searchMemberOfOrganization({
    organization_id: organizationId,
    user_id: userId,
  });

  if (!member) return null;

  return member;
}

export async function isMember(userId: number, organizationId: number) {
  const member: memberRowSchema | null = await searchMemberOfOrganization({
    organization_id: organizationId,
    user_id: userId,
  });

  if (!member) return false;

  return true;
}
