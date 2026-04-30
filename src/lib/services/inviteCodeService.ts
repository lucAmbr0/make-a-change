import { requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import { NotFoundError, ValidationError } from "../errors/ApiError";
import {
  decrementInviteCodeUses,
  deleteInviteCodeByCodeInOrganization,
  getInviteCodeByCode,
  getInviteCodeByCodeInOrganization,
  getInviteCodesForOrganization,
  insertInviteCode,
  inviteCodeExists,
} from "../db/invite_codes";
import {
  createInviteCodeInput,
  deleteInviteCodeInput,
  inviteCodeRowSchema,
  joinWithInviteCodeInput,
} from "../schemas/invite_codes";
import { authGetOrganization } from "./organizationService";
import { addMemberForUser } from "./memberService";
import { requireOrganizationModeratorOrOwner } from "../auth/permissions";
import { parseBody } from "../api/body";

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
  ctx: RequestCtx,
  organizationId: number,
) {
  const auth = requireAuthCtx(ctx);
  await authGetOrganization(ctx, organizationId);
  await requireOrganizationModeratorOrOwner(auth.userId, organizationId, ctx);

  const inviteCodes: inviteCodeRowSchema[] = await getInviteCodesForOrganization(
    { organization_id: organizationId },
  );
  return inviteCodes;
}

export async function createInviteCode(
  ctx: RequestCtx,
  organizationId: number,
) {
  const auth = requireAuthCtx(ctx);
  await authGetOrganization(ctx, organizationId);
  await requireOrganizationModeratorOrOwner(auth.userId, organizationId, ctx);

  const input = await parseBody(ctx, createInviteCodeInput);

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
  ctx: RequestCtx,
  organizationId: number,
) {
  const auth = requireAuthCtx(ctx);
  await authGetOrganization(ctx, organizationId);
  await requireOrganizationModeratorOrOwner(auth.userId, organizationId, ctx);

  const input = await parseBody(ctx, deleteInviteCodeInput);

  const existingCode = await getInviteCodeByCodeInOrganization({
    code: input.code,
    organization_id: organizationId,
  });
  if (!existingCode) throw new NotFoundError("Invite code not found.");

  await deleteInviteCodeByCodeInOrganization({
    code: input.code,
    organization_id: organizationId,
  });

  return true;
}

export async function joinOrganizationWithInviteCode(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, joinWithInviteCodeInput);

  const inviteCode = await getInviteCodeByCode({ code: input.invite_code });
  if (!inviteCode) throw new NotFoundError("Invite code not found.");

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
