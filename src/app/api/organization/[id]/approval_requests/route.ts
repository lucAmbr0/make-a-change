import {
  authGetApprovalRequests,
  resolveApprovalRequest,
} from "@/lib/services/approvalRequestService";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string };

export const GET = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  return await authGetApprovalRequests(ctx, organizationId);
});

export const POST = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  const result = await resolveApprovalRequest(ctx, organizationId);

  if (result.type === "approved") {
    return result.member;
  }

  return {
    organization_id: result.approvalRequest.organization_id,
    user_id: result.approvalRequest.user_id,
    requested_at: result.approvalRequest.requested_at,
    approval: false,
  };
});
