import { NextRequest } from "next/server";
import { ZodError, ZodIssue } from "zod";
import { requireAuth } from "../auth/auth";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/ApiError";
import {
  decrementInviteCodeUses,
  deleteInviteCodeByCodeInOrganization,
  getInviteCodeByCode,
  getInviteCodeByCodeInOrganization,
  getInviteCodesForOrganization,
  insertInviteCode,
  inviteCodeExists,
} from "../db/invite_codes";
import { searchMemberOfOrganization } from "../db/members";
import {
  createInviteCodeInput,
  deleteInviteCodeInput,
  inviteCodeRowSchema,
  joinWithInviteCodeInput,
} from "../schemas/invite_codes";
import { authGetOrganization } from "./organizationService";
import { addMemberForUser } from "./memberService";
import { requireOrganizationModeratorOrOwner } from "../auth/permissions";

async function requireModeratorOrOwner(
  userId: number,
  organizationId: number,
) {
  // Use centralized permission system (includes superuser bypass)
  await requireOrganizationModeratorOrOwner(userId, organizationId);
}

function generateInviteCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters[Math.floor(Math.random() * letters.length)];
  }
  code += "-";
  for (let i = 0; i < 3; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

async function generateUniqueInviteCode(): Promise<string> {
  const MAX_ATTEMPTS = 20;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = generateInviteCode();
    const exists = await inviteCodeExists({ code });
    if (!exists) return code;
  }
  throw new ValidationError(
    "Failed to generate a unique invite code. Please try again.",
    { operation: "generateUniqueInviteCode" },
  );
}

export async function authGetInviteCodes(
  req: NextRequest,
  organizationId: number,
) {
  const auth = requireAuth(req);

  // Verify the organization exists and is visible to this user
  await authGetOrganization(req, organizationId);

  await requireModeratorOrOwner(auth.userId, organizationId);

  const inviteCodes: inviteCodeRowSchema[] = await getInviteCodesForOrganization(
    { organization_id: organizationId },
  );

  return inviteCodes;
}

export async function createInviteCode(
  req: NextRequest,
  organizationId: number,
) {
  const auth = requireAuth(req);

  // Verify the organization exists and is visible to this user
  await authGetOrganization(req, organizationId);

  await requireModeratorOrOwner(auth.userId, organizationId);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  let input: createInviteCodeInput;
  try {
    input = createInviteCodeInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  const code = await generateUniqueInviteCode();

  const expiresAt = input.expires_at ? new Date(input.expires_at) : null;

  const inviteCode: inviteCodeRowSchema = await insertInviteCode({
    organization_id: organizationId,
    code,
    uses: input.uses,
    expires_at: expiresAt,
  });

  return inviteCode;
}

export async function authDeleteInviteCode(
  req: NextRequest,
  organizationId: number,
) {
  const auth = requireAuth(req);

  // Verify the organization exists and is visible to this user
  await authGetOrganization(req, organizationId);

  await requireModeratorOrOwner(auth.userId, organizationId);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  let input: deleteInviteCodeInput;
  try {
    input = deleteInviteCodeInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  const existingCode = await getInviteCodeByCodeInOrganization({
    code: input.code,
    organization_id: organizationId,
  });

  if (!existingCode) {
    throw new NotFoundError("Invite code not found.");
  }

  await deleteInviteCodeByCodeInOrganization({
    code: input.code,
    organization_id: organizationId,
  });

  return true;
}

export async function joinOrganizationWithInviteCode(req: NextRequest) {
  const auth = requireAuth(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  let input: joinWithInviteCodeInput;
  try {
    input = joinWithInviteCodeInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  const inviteCode = await getInviteCodeByCode({ code: input.invite_code });

  if (!inviteCode) {
    throw new NotFoundError("Invite code not found.");
  }

  if (inviteCode.expires_at && inviteCode.expires_at < new Date()) {
    throw new ValidationError("Invite code has expired.", {
      invite_code: input.invite_code,
    });
  }

  if (inviteCode.uses <= 0) {
    throw new ValidationError("Invite code has no remaining uses.", {
      invite_code: input.invite_code,
    });
  }

  const member = await addMemberForUser(auth.userId, inviteCode.organization_id);

  await decrementInviteCodeUses({ id: inviteCode.id });

  return member;
}