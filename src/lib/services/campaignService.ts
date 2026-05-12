import { getOptionalAuth, requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import { NotFoundError, UnauthorizedError } from "../errors/ApiError";
import {
  campaignResponseSchema,
  campaignRowSchema,
  createCampaignInput,
  updateCampaignInput,
} from "../schemas/campaigns";
import {
  deleteCampaign,
  getCampaignsForUser,
  getCampaignsForUserWithDetails,
  getCampaignsForOrganization,
  getCampaignsBySignatures,
  getCampaignsFromUserOrganizations,
  getCampaignsWithoutOrganization,
  insertCampaign,
  updateCampaign,
  campaignExists,
  getCampaign,
  getCampaignUnauthorized,
} from "../db/campaigns";
import { parseBody } from "../api/body";
import {
  isOrganizationMember,
  isSuperUser,
  requireCampaignDelete,
  requireCampaignEdit,
  canAccessCampaign,
} from "../auth/permissions";
import {
  buildCampaignPermissions,
  decorateCampaign,
  decorateCampaigns,
} from "./permissionsDecorator";

export async function createCampaign(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, createCampaignInput);

  if (input.organization_id) {
    const isMember = await isOrganizationMember(
      auth.userId,
      input.organization_id,
      ctx,
    );
    if (!isMember) {
      throw new UnauthorizedError(
        "Can't create a campaign inside an organization you're not a member of",
      );
    }
  }

  const creation_date = new Date();

  const campaign: campaignRowSchema = await insertCampaign({
    organization_id: input.organization_id || null,
    creator_id: auth.userId,
    title: input.title,
    description: input.description || null,
    created_at: creation_date,
    cover_path: input.cover_path || null,
    signature_goal: input.signature_goal || null,
    is_public: input.is_public,
    comments_active: input.comments_active,
    comments_require_approval: input.comments_require_approval,
  });

  return campaign;
}

export async function getAuthorizedCampaings(ctx: RequestCtx) {
  const auth = getOptionalAuth(ctx);
  return await getCampaignsForUser({ user_id: auth.userId });
}

export async function getAuthorizedCampaignsWithDetails(ctx: RequestCtx) {
  const auth = getOptionalAuth(ctx);
  const campaigns = await getCampaignsForUserWithDetails({
    user_id: auth.userId,
  });
  return await decorateCampaigns(campaigns, auth.userId, ctx);
}

export async function authUpdateCampaign(
  ctx: RequestCtx,
  campaignId: number,
) {
  const auth = requireAuthCtx(ctx);

  const exists = await campaignExists({ campaign_id: campaignId });
  if (!exists) {
    throw new NotFoundError("Campaign not found.", {
      operation: "authUpdateCampaign",
      campaignId,
    });
  }

  await requireCampaignEdit(auth.userId, campaignId, ctx);

  const input = await parseBody(ctx, updateCampaignInput);
  await updateCampaign({ id: campaignId, fields: input });

  return await authGetCampaign(ctx, campaignId);
}

export async function authDeleteCampaign(ctx: RequestCtx, campaignId: number) {
  const auth = requireAuthCtx(ctx);

  const exists = await campaignExists({ campaign_id: campaignId });
  if (!exists) {
    throw new NotFoundError("Campaign not found.", {
      operation: "authDeleteCampaign",
      campaignId,
    });
  }

  await requireCampaignDelete(auth.userId, campaignId, ctx);
  await deleteCampaign({ id: campaignId });
  return true;
}

export async function authGetCampaign(ctx: RequestCtx, campaignId: number) {
  const auth = getOptionalAuth(ctx);

  const canAccess = await canAccessCampaign(auth.userId, campaignId, ctx);
  if (!canAccess) {
    throw new NotFoundError("Campaign not found.");
  }

  const isAdmin =
    auth.userId !== null && (await isSuperUser(auth.userId, ctx));

  const campaign: campaignResponseSchema = isAdmin
    ? await getCampaignUnauthorized({ campaign_id: campaignId })
    : await getCampaign({
        user_id: auth.userId,
        campaign_id: campaignId,
      });

  if (!campaign) {
    throw new NotFoundError("Campaign not found.");
  }

  return await decorateCampaign(campaign, auth.userId, ctx);
}

export async function getOrganizationCampaigns(
  ctx: RequestCtx,
  organizationId: number,
) {
  const auth = getOptionalAuth(ctx);
  const campaigns = await getCampaignsForOrganization({
    user_id: auth.userId,
    organization_id: organizationId,
  });
  return await decorateCampaigns(campaigns, auth.userId, ctx);
}

export async function getCampaignsFromSameOrganization(
  ctx: RequestCtx,
  organizationId: number,
  excludeCampaignId: number,
) {
  const auth = getOptionalAuth(ctx);
  const campaigns = await getCampaignsForOrganization({
    user_id: auth.userId,
    organization_id: organizationId,
    exclude_campaign_id: excludeCampaignId,
  });
  return await decorateCampaigns(campaigns, auth.userId, ctx);
}

export async function getFeaturedCampaigns(ctx: RequestCtx) {
  const auth = getOptionalAuth(ctx);
  const campaigns = await getCampaignsBySignatures({ user_id: auth.userId });
  return await decorateCampaigns(campaigns, auth.userId, ctx);
}

export async function getUserOrganizationsCampaigns(ctx: RequestCtx) {
  const auth = getOptionalAuth(ctx);
  if (!auth.userId) return [];

  const campaigns = await getCampaignsFromUserOrganizations({
    user_id: auth.userId,
  });
  return await decorateCampaigns(campaigns, auth.userId, ctx);
}

export async function getIndependentCampaigns(ctx: RequestCtx) {
  const auth = getOptionalAuth(ctx);
  const campaigns = await getCampaignsWithoutOrganization({
    user_id: auth.userId,
  });
  return await decorateCampaigns(campaigns, auth.userId, ctx);
}
