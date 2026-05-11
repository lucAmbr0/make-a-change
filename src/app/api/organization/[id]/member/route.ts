import {
  addMember,
  authGetMembersCount,
  authDeleteMember,
  authUpdateMemberModerator,
} from "@/lib/services/memberService";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string };

export const GET = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  const members = await authGetMembersCount(ctx, organizationId);
  return { organization_id: organizationId, members_count: members };
});

export const POST = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  return await addMember(ctx, organizationId);
});

export const PATCH = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  return await authUpdateMemberModerator(ctx, organizationId);
});

export const DELETE = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  await authDeleteMember(ctx, organizationId);
  return null;
});
