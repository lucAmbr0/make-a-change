import { getOptionalAuth, requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import { NotFoundError, ValidationError } from "../errors/ApiError";
import {
  deleteMember,
  getMembersCount,
  getMembersList,
  insertMember,
  searchMemberOfOrganization,
} from "../db/members";
import {
  createMemberInput,
  deleteMemberInput,
  memberResponseSchema,
  memberRowSchema,
} from "../schemas/members";
import { getOrganization } from "../db/organizations";
import { organizationResponseSchema } from "../schemas/organization";
import { requireOrganizationModeratorOrOwner } from "../auth/permissions";
import { parseBody } from "../api/body";

export async function addMemberForUser(
  userId: number,
  organizationId: number,
  input: createMemberInput = {},
) {
  if (
    await searchMemberOfOrganization({
      organization_id: organizationId,
      user_id: userId,
    })
  ) {
    throw new ValidationError("User is already a member of this organization", {
      error: "Duplicate member",
    });
  }

  const member: memberRowSchema = await insertMember({
    organization_id: organizationId,
    user_id: userId,
    is_moderator: input.is_moderator,
    is_owner: input.is_owner,
  });

  return member;
}

export async function addMember(ctx: RequestCtx, organizationId: number) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, createMemberInput);
  return await addMemberForUser(auth.userId, organizationId, input);
}

export async function authDeleteMember(
  ctx: RequestCtx,
  organizationId: number,
) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, deleteMemberInput);

  const memberToRemove = await searchMemberOfOrganization({
    organization_id: organizationId,
    user_id: input.user_id,
  });

  if (!memberToRemove) {
    throw new NotFoundError("Member not found in this organization.");
  }

  if (auth.userId !== input.user_id) {
    await requireOrganizationModeratorOrOwner(auth.userId, organizationId, ctx);
  }

  await deleteMember({
    user_id: input.user_id,
    organization_id: organizationId,
  });

  return true;
}

export async function getMember(userId: number, organizationId: number) {
  return await searchMemberOfOrganization({
    organization_id: organizationId,
    user_id: userId,
  });
}

async function ensureOrganizationVisible(
  ctx: RequestCtx,
  organizationId: number,
): Promise<organizationResponseSchema> {
  const auth = getOptionalAuth(ctx);
  const organization: organizationResponseSchema = await getOrganization({
    user_id: auth.userId,
    organization_id: organizationId,
  });
  if (!organization) throw new NotFoundError("Organization not found");
  return organization;
}

export async function authGetMembersList(
  ctx: RequestCtx,
  organizationId: number,
) {
  const organization = await ensureOrganizationVisible(ctx, organizationId);
  const members: memberResponseSchema[] = await getMembersList({
    organization_id: organization.id,
  });
  return members;
}

export async function authGetMembersCount(
  ctx: RequestCtx,
  organizationId: number,
) {
  const organization = await ensureOrganizationVisible(ctx, organizationId);
  return await getMembersCount({ organization_id: organization.id });
}
