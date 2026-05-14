import { getOptionalAuth, requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import { NotFoundError, ValidationError } from "../errors/ApiError";
import {
  deleteCommentByIdInCampaign,
  getCommentByIdInCampaign,
  getCommentsForCampaign,
  insertComment,
  updateCommentVisibilityByIdInCampaign,
} from "../db/comments";
import {
  commentResponseSchema,
  commentRowSchema,
  createCommentInput,
  deleteCommentInput,
  moderateCommentInput,
} from "../schemas/comments";
import { authGetCampaign } from "./campaignService";
import {
  requireCommentDelete,
  requireCommentModeration,
} from "../auth/permissions";
import { getMember } from "./memberService";
import { parseBody } from "../api/body";
import { decorateComments } from "./permissionsDecorator";

export type moderateCommentResult =
  | { type: "approved"; comment: commentRowSchema }
  | { type: "rejected"; comment: commentRowSchema };

export async function authGetCampaignComments(
  ctx: RequestCtx,
  campaignId: number,
) {
  const auth = getOptionalAuth(ctx);

  // Enforce campaign-level visibility (throws NotFound if no access).
  await authGetCampaign(ctx, campaignId);

  const comments: commentResponseSchema[] = await getCommentsForCampaign({
    user_id: auth.userId,
    campaign_id: campaignId,
  });

  return await decorateComments(comments, auth.userId, ctx);
}

export async function createComment(ctx: RequestCtx, campaignId: number) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, createCommentInput);

  const campaign = await authGetCampaign(ctx, campaignId);
  if (!campaign) throw new NotFoundError("Campaign not found.");

  if (!campaign.comments_active) {
    throw new ValidationError("Comments are disabled for this campaign", {
      campaign_id: campaignId,
    });
  }

  let isVisible = !campaign.comments_require_approval;

  if (!isVisible) {
    const isCampaignOwner = campaign.creator_id === auth.userId;
    const memberRecord = campaign.organization_id
      ? await getMember(auth.userId, campaign.organization_id).catch(() => null)
      : null;
    const isOrgPrivileged = !!(memberRecord?.is_moderator || memberRecord?.is_owner);
    if (isCampaignOwner || isOrgPrivileged) isVisible = true;
  }

  const comment: commentRowSchema = await insertComment({
    user_id: auth.userId,
    campaign_id: campaignId,
    text: input.text,
    created_at: new Date(),
    visible: isVisible,
  });

  return comment;
}

export async function authDeleteComment(
  ctx: RequestCtx,
  campaignId: number,
) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, deleteCommentInput);

  const existingComment = await getCommentByIdInCampaign({
    comment_id: input.comment_id,
    campaign_id: campaignId,
  });
  if (!existingComment) throw new NotFoundError("Comment not found.");

  await requireCommentDelete(auth.userId, input.comment_id, campaignId, ctx);

  await deleteCommentByIdInCampaign({
    comment_id: input.comment_id,
    campaign_id: campaignId,
  });

  return true;
}

export async function authModerateComment(
  ctx: RequestCtx,
  campaignId: number,
  commentId: number,
): Promise<moderateCommentResult> {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, moderateCommentInput);

  const existingComment = await getCommentByIdInCampaign({
    comment_id: commentId,
    campaign_id: campaignId,
  });
  if (!existingComment) throw new NotFoundError("Comment not found.");

  await requireCommentModeration(auth.userId, campaignId, ctx);

  if (input.comment_approval) {
    const updatedComment = await updateCommentVisibilityByIdInCampaign({
      comment_id: commentId,
      campaign_id: campaignId,
      visible: true,
    });
    return { type: "approved", comment: updatedComment };
  }

  await deleteCommentByIdInCampaign({
    comment_id: commentId,
    campaign_id: campaignId,
  });
  return { type: "rejected", comment: existingComment };
}
