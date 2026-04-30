import { getMember } from "@/lib/services/memberService";
import { requireAuthCtx } from "@/lib/auth/auth";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string };

export const GET = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  const auth = requireAuthCtx(ctx);
  const member = await getMember(auth.userId, organizationId);

  if (!member) return { is_member: false };

  return {
    is_member: true,
    user_id: member.user_id,
    is_moderator: Boolean(member.is_moderator),
    is_owner: Boolean(member.is_owner),
  };
});
