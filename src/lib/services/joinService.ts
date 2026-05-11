import { requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import {
  decrementInviteCodeUses,
  getInviteCodeByCode,
} from "../db/invite_codes";
import {
  getApprovalRequest,
  insertApprovalRequest,
} from "../db/approval_requests";
import { getOrganizationById } from "../db/organizations";
import { NotFoundError, ValidationError } from "../errors/ApiError";
import { approvalRequestRowSchema } from "../schemas/approval_requests";
import { inviteCodeRowSchema } from "../schemas/invite_codes";
import { joinOrganizationInput } from "../schemas/join";
import { memberRowSchema } from "../schemas/members";
import { organizationRowSchema } from "../schemas/organization";
import { addMemberForUser, getMember } from "./memberService";
import { parseBody } from "../api/body";

export type joinOrganizationResult =
  | { type: "member"; member: memberRowSchema }
  | { type: "approval_request"; approvalRequest: approvalRequestRowSchema };

function normalizeOrganizationId(input: joinOrganizationInput) {
  return input.organization_id ?? input.organizationId;
}

async function validateInviteCodeForJoin(inviteCode: string) {
  const code: inviteCodeRowSchema | null = await getInviteCodeByCode({
    code: inviteCode,
  });

  if (!code) throw new NotFoundError("Invite code not found.");

  if (code.expires_at && code.expires_at < new Date()) {
    throw new ValidationError("Invite code has expired.", {
      invite_code: inviteCode,
    });
  }

  if (code.uses <= 0) {
    throw new ValidationError("Invite code has no remaining uses.", {
      invite_code: inviteCode,
    });
  }

  return code;
}

export async function joinOrganization(
  ctx: RequestCtx,
): Promise<joinOrganizationResult> {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, joinOrganizationInput);

  const inviteCode = input.invite_code
    ? await validateInviteCodeForJoin(input.invite_code)
    : null;
  const organizationId = inviteCode
    ? inviteCode.organization_id
    : normalizeOrganizationId(input);

  if (organizationId === undefined) {
    throw new ValidationError("Organization ID is required", {
      error: "organization_id must be provided when no invite_code is used",
    });
  }

  if (
    inviteCode &&
    normalizeOrganizationId(input) !== undefined &&
    normalizeOrganizationId(input) !== inviteCode.organization_id
  ) {
    throw new ValidationError("Invite code does not match organization.", {
      organization_id: normalizeOrganizationId(input),
      invite_code: input.invite_code,
    });
  }

  const organization: organizationRowSchema | null = await getOrganizationById({
    organization_id: organizationId,
  });

  if (!organization) throw new NotFoundError("Organization not found.");
  if (!organization.is_public && !inviteCode) {
    throw new NotFoundError("Organization not found.");
  }

  const existingMember = await getMember(auth.userId, organization.id);
  if (existingMember) {
    throw new ValidationError("User is already a member of this organization.", {
      error: "Duplicate member",
    });
  }

  if (organization.requires_approval) {
    const pendingRequest = await getApprovalRequest({
      user_id: auth.userId,
      organization_id: organization.id,
    });

    if (pendingRequest) {
      throw new ValidationError("User already has a pending approval request for this organization.", {
        organization_id: organization.id,
      });
    }

    const approvalRequest = await insertApprovalRequest({
      user_id: auth.userId,
      organization_id: organization.id,
      requested_at: new Date(),
    });

    if (inviteCode) await decrementInviteCodeUses({ id: inviteCode.id });

    return { type: "approval_request", approvalRequest };
  }

  const member = await addMemberForUser(auth.userId, organization.id);
  if (inviteCode) await decrementInviteCodeUses({ id: inviteCode.id });

  return { type: "member", member };
}
