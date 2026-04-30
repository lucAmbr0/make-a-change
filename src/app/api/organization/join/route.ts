import { joinOrganization } from "@/lib/services/joinService";
import { route } from "@/lib/api/handler";

export const POST = route(async (ctx) => {
  const result = await joinOrganization(ctx);

  if (result.type === "member") {
    return result.member;
  }

  return {
    organization_id: result.approvalRequest.organization_id,
    user_id: result.approvalRequest.user_id,
    requested_at: result.approvalRequest.requested_at,
  };
});
