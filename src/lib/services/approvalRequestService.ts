import { NextRequest } from "next/server";
import { ZodError, ZodIssue } from "zod";
import { requireAuth } from "../auth/auth";
import {
  deleteApprovalRequest,
  getApprovalRequest,
  getApprovalRequestsForOrganization,
} from "../db/approval_requests";
import {
  NotFoundError,
  ValidationError,
} from "../errors/ApiError";
import {
  approvalRequestDecisionInput,
  approvalRequestResponseSchema,
  approvalRequestRowSchema,
} from "../schemas/approval_requests";
import { memberRowSchema } from "../schemas/members";
import { authGetOrganization } from "./organizationService";
import { addMemberForUser, requireModeratorOrOwner } from "./memberService";

export type resolveApprovalRequestResult =
  | {
      type: "approved";
      member: memberRowSchema;
    }
  | {
      type: "rejected";
      approvalRequest: approvalRequestRowSchema;
    };

function normalizeUserId(input: approvalRequestDecisionInput) {
  return input.user_id ?? input.userId ?? input.userI_id;
}

export async function authGetApprovalRequests(
  req: NextRequest,
  organizationId: number,
) {
  const auth = requireAuth(req);

  await authGetOrganization(req, organizationId);
  await requireModeratorOrOwner(auth.userId, organizationId);

  const approvalRequests: approvalRequestResponseSchema[] =
    await getApprovalRequestsForOrganization({
      organization_id: organizationId,
    });

  return approvalRequests;
}

export async function resolveApprovalRequest(
  req: NextRequest,
  organizationId: number,
): Promise<resolveApprovalRequestResult> {
  const auth = requireAuth(req);

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

  let input: approvalRequestDecisionInput;
  try {
    input = approvalRequestDecisionInput.parse(body);
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

  if (!approvalRequest) {
    throw new NotFoundError("Approval request not found.");
  }

  if (input.approval) {
    const member = await addMemberForUser(userId, organizationId);
    await deleteApprovalRequest({
      user_id: userId,
      organization_id: organizationId,
    });

    return {
      type: "approved",
      member,
    };
  }

  await deleteApprovalRequest({
    user_id: userId,
    organization_id: organizationId,
  });

  return {
    type: "rejected",
    approvalRequest,
  };
}