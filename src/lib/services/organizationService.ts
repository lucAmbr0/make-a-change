import { getOptionalAuth, requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import { insertMember } from "../db/members";
import {
  getOrganization,
  getOrganizationsForUser,
  getOrganizationsNames,
  insertOrganization,
  deleteOrganization,
  getAllPublicOrganizationsWithCounts,
} from "../db/organizations";
import { NotFoundError, ValidationError } from "../errors/ApiError";
import { memberRowSchema } from "../schemas/members";
import {
  createOrganizationInput,
  organizationNameSchema,
  organizationResponseSchema,
  organizationRowSchema,
} from "../schemas/organization";
import { parseBody } from "../api/body";
import { requireOrganizationDelete } from "../auth/permissions";

export async function createOrganization(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, createOrganizationInput);

  await organizationNamesExists(input.name);

  const organization: organizationRowSchema = await insertOrganization({
    creator_id: auth.userId,
    name: input.name,
    description: input.description || null,
    created_at: new Date(),
    cover_path: input.cover_path || null,
    is_public: input.is_public,
    requires_approval: input.requires_approval,
  });

  const member: memberRowSchema = await insertMember({
    user_id: auth.userId,
    organization_id: organization.id,
    is_moderator: true,
    is_owner: true,
  });

  return organization;
}

async function organizationNamesExists(name: string) {
  const organizationNames: organizationNameSchema[] =
    await getOrganizationsNames();

  if (organizationNames.some((org: { name: string }) => org.name === name)) {
    throw new ValidationError("Organization name already exists", {
      error: "An organization with this name already exists",
    });
  }
  return false;
}

export async function getOrganizationsList(ctx: RequestCtx) {
  const auth = getOptionalAuth(ctx);
  return await getAllPublicOrganizationsWithCounts({ user_id: auth.userId });
}

export async function getAuthorizedOrganizations(ctx: RequestCtx) {
  const auth = getOptionalAuth(ctx);
  return await getOrganizationsForUser({ user_id: auth.userId });
}

export async function authGetOrganization(
  ctx: RequestCtx,
  organizationId: number,
) {
  const auth = getOptionalAuth(ctx);
  const organization: organizationResponseSchema = await getOrganization({
    user_id: auth.userId,
    organization_id: organizationId,
  });

  if (!organization) {
    throw new NotFoundError("Organization not found.");
  }

  return organization;
}

export async function authDeleteOrganization(
  ctx: RequestCtx,
  organizationId: number,
) {
  const auth = requireAuthCtx(ctx);

  const organization = await getOrganization({
    user_id: auth.userId,
    organization_id: organizationId,
  });

  if (!organization) {
    throw new NotFoundError("Organization not found.");
  }

  await requireOrganizationDelete(auth.userId, organizationId, ctx);

  await deleteOrganization({ organization_id: organizationId });
  return true;
}
