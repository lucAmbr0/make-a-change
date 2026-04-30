import { requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import {
  deleteApprovalRequest,
  getApprovalRequest,
  getApprovalRequestsForOrganization,
} from "../db/approval_requests";
import { NotFoundError, ValidationError } from "../errors/ApiError";
import {
  approvalRequestDecisionInput,
  approvalRequestResponseSchema,
  approvalRequestRowSchema,
} from "../schemas/approval_requests";
import { memberRowSchema } from "../schemas/members";
import { authGetOrganization } from "./organizationService";
import { addMemberForUser } from "./memberService";
import { requireOrganizationModeratorOrOwner } from "../auth/permissions";
import { parseBody } from "../api/body";

export type resolveApprovalRequestResult =
  | { type: "approved"; member: memberRowSchema }
  | { type: "rejected"; approvalRequest: approvalRequestRowSchema };

function normalizeUserId(input: approvalRequestDecisionInput) {
  return input.user_id ?? input.userId ?? input.userI_id;
}

export async function authGetApprovalRequests(
  ctx: RequestCtx,
  organizationId: number,
) {
  const auth = requireAuthCtx(ctx);
  await authGetOrganization(ctx, organizationId);
  await requireOrganizationModeratorOrOwner(auth.userId, organizationId, ctx);

  const approvalRequests: approvalRequestResponseSchema[] =
    await getApprovalRequestsForOrganization({
      organization_id: organizationId,
    });
  return approvalRequests;
}

export async function resolveApprovalRequest(
  ctx: RequestCtx,
  organizationId: number,
): Promise<resolveApprovalRequestResult> {
  const auth = requireAuthCtx(ctx);
  await authGetOrganization(ctx, organizationId);
  await requireOrganizationModeratorOrOwner(auth.userId, organizationId, ctx);

  const input = await parseBody(ctx, approvalRequestDecisionInput);
  const userId = normalizeUserId(input);
  if (userId === undefined) {
    throw new ValidationError("User ID is required", {
      error: "user_id must be a valid number",
    });
  }

  const approvalRequest = await getApprovalRequest({
    user_id: userId,
    organization_id: organizationId,
  });
  if (!approvalRequest) throw new NotFoundError("Approval request not found.");

  if (input.approval) {
    const member = await addMemberForUser(userId, organizationId);
    await deleteApprovalRequest({
      user_id: userId,
      organization_id: organizationId,
    });
    return { type: "approved", member };
  }

  await deleteApprovalRequest({
    user_id: userId,
    organization_id: organizationId,
  });
  return { type: "rejected", approvalRequest };
}
