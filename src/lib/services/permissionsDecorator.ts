import type { RequestCtx } from "../auth/ctx";
import type {
  campaignResponseSchema,
  campaignPermissionsSchema,
} from "../schemas/campaigns";
import type {
  commentResponseSchema,
  commentPermissionsSchema,
} from "../schemas/comments";
import {
  canDeleteCampaign,
  canDeleteComment,
  canEditCampaign,
  canModerateComments,
} from "../auth/permissions";

/**
 * Compute the permissions block for a single campaign relative to a user.
 * Pass `null` for anonymous viewers.
 */
export async function buildCampaignPermissions(
  campaign: campaignResponseSchema,
  userId: number | null,
  ctx?: RequestCtx,
): Promise<campaignPermissionsSchema> {
  if (!userId) {
    return {
      can_view: true,
      can_edit: false,
      can_delete: false,
      can_moderate_comments: false,
      can_comment: false,
      can_sign: false,
    };
  }

  const [canDelete, canModerate, canEdit] = await Promise.all([
    canDeleteCampaign(userId, campaign.id, ctx),
    canModerateComments(userId, campaign.id, ctx),
    canEditCampaign(userId, campaign.id, ctx),
  ]);

  return {
    can_view: true,
    can_edit: canEdit,
    can_delete: canDelete,
    can_moderate_comments: canModerate,
    can_comment: campaign.comments_active && !campaign.is_archived,
    can_sign: !campaign.is_archived,
  };
}

export async function decorateCampaign(
  campaign: campaignResponseSchema,
  userId: number | null,
  ctx?: RequestCtx,
): Promise<campaignResponseSchema> {
  campaign.permissions = await buildCampaignPermissions(campaign, userId, ctx);
  return campaign;
}

export async function decorateCampaigns(
  campaigns: campaignResponseSchema[],
  userId: number | null,
  ctx?: RequestCtx,
): Promise<campaignResponseSchema[]> {
  await Promise.all(
    campaigns.map((c) => decorateCampaign(c, userId, ctx)),
  );
  return campaigns;
}

export async function buildCommentPermissions(
  comment: commentResponseSchema,
  userId: number | null,
  ctx?: RequestCtx,
): Promise<commentPermissionsSchema> {
  if (!userId) {
    return { can_delete: false, can_moderate: false };
  }
  if (comment.user_id === userId) {
    return {
      can_delete: true,
      can_moderate: await canModerateComments(userId, comment.campaign_id, ctx),
    };
  }
  const [canDelete, canModerate] = await Promise.all([
    canDeleteComment(userId, comment.id, comment.campaign_id, ctx),
    canModerateComments(userId, comment.campaign_id, ctx),
  ]);
  return { can_delete: canDelete, can_moderate: canModerate };
}

export async function decorateComment(
  comment: commentResponseSchema,
  userId: number | null,
  ctx?: RequestCtx,
): Promise<commentResponseSchema> {
  comment.permissions = await buildCommentPermissions(comment, userId, ctx);
  return comment;
}

export async function decorateComments(
  comments: commentResponseSchema[],
  userId: number | null,
  ctx?: RequestCtx,
): Promise<commentResponseSchema[]> {
  await Promise.all(comments.map((c) => decorateComment(c, userId, ctx)));
  return comments;
}
