import {
  authDeleteInviteCode,
  authGetInviteCodes,
  createInviteCode,
} from "@/lib/services/inviteCodeService";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string };

export const GET = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  return await authGetInviteCodes(ctx, organizationId);
});

export const POST = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  return await createInviteCode(ctx, organizationId);
});

export const DELETE = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  await authDeleteInviteCode(ctx, organizationId);
  return null;
});
