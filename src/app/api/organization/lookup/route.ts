import { lookupOrganizationByInviteCode } from "@/lib/services/inviteCodeService";
import { route } from "@/lib/api/handler";

export const GET = route(async (ctx) => {
  return await lookupOrganizationByInviteCode(ctx);
});
