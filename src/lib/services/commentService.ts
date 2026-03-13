import { NextRequest } from "next/server";
import { ZodError, ZodIssue } from "zod";
import { getTokenFromRequest, requireAuth } from "../auth/auth";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/ApiError";
import {
  checkModerateCommentPrivileges,
  checkDeleteCommentPrivileges,
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

export type moderateCommentResult =
  | {
      type: "approved";
      comment: commentRowSchema;
    }
  | {
      type: "rejected";
      comment: commentRowSchema;
    };

export async function authGetCampaignComments(
  req: NextRequest,
  campaignId: number,
) {
  const token = getTokenFromRequest(req);
  const auth = token ? requireAuth(req) : { userId: null };

  // This enforces campaign-level visibility using the existing campaign access policy.
  await authGetCampaign(req, campaignId);

  const comments: commentResponseSchema[] = await getCommentsForCampaign({
    user_id: auth.userId,
    campaign_id: campaignId,
  });

  return comments;
}

export async function createComment(req: NextRequest, campaignId: number) {
  const auth = requireAuth(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  let input;
  try {
    input = createCommentInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  const campaign = await authGetCampaign(req, campaignId);
  if (!campaign || campaign === null) {
    throw new NotFoundError("Campaign not found.");
  }

  if (!campaign.comments_active) {
    throw new ValidationError("Comments are disabled for this campaign", {
      campaign_id: campaignId,
    });
  }

  const isVisible = !campaign.comments_require_approval;

  const creationDate = new Date();
  const comment: commentRowSchema = await insertComment({
    user_id: auth.userId,
    campaign_id: campaignId,
    text: input.text,
    created_at: creationDate,
    visible: isVisible,
  });

  return comment;
}

export async function authDeleteComment(req: NextRequest, campaignId: number) {
  const auth = requireAuth(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  let input;
  try {
    input = deleteCommentInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  const existingComment = await getCommentByIdInCampaign({
    comment_id: input.comment_id,
    campaign_id: campaignId,
  });

  if (!existingComment) {
    throw new NotFoundError("Comment not found.");
  }

  const hasPrivileges = await checkDeleteCommentPrivileges({
    user_id: auth.userId,
    campaign_id: campaignId,
    comment_id: input.comment_id,
  });

  if (!hasPrivileges) {
    throw new UnauthorizedError(
      "You don't have permission to delete this comment.",
    );
  }

  await deleteCommentByIdInCampaign({
    comment_id: input.comment_id,
    campaign_id: campaignId,
  });

  return true;
}

export async function authModerateComment(
  req: NextRequest,
  campaignId: number,
  commentId: number,
): Promise<moderateCommentResult> {
  const auth = requireAuth(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  let input;
  try {
    input = moderateCommentInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  const existingComment = await getCommentByIdInCampaign({
    comment_id: commentId,
    campaign_id: campaignId,
  });

  if (!existingComment) {
    throw new NotFoundError("Comment not found.");
  }

  const hasPrivileges = await checkModerateCommentPrivileges({
    user_id: auth.userId,
    campaign_id: campaignId,
  });

  if (!hasPrivileges) {
    throw new UnauthorizedError(
      "You don't have permission to moderate comments for this campaign.",
    );
  }

  if (input.comment_approval) {
    const updatedComment = await updateCommentVisibilityByIdInCampaign({
      comment_id: commentId,
      campaign_id: campaignId,
      visible: true,
    });

    return {
      type: "approved",
      comment: updatedComment,
    };
  }

  await deleteCommentByIdInCampaign({
    comment_id: commentId,
    campaign_id: campaignId,
  });

  return {
    type: "rejected",
    comment: existingComment,
  };
}