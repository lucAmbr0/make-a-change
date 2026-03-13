import {
  ApiError,
  InternalServerError,
  ValidationError,
} from "@/lib/errors/ApiError";
import {
  authModerateComment,
  moderateCommentResult,
} from "@/lib/services/commentService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; commentId: string }> },
) {
  try {
    const { id, commentId } = await params;
    const campaignId = parseInt(id, 10);
    const parsedCommentId = parseInt(commentId, 10);

    if (isNaN(campaignId)) {
      throw new ValidationError("Invalid campaign ID", {
        error: "Campaign ID must be a valid number",
      });
    }

    if (isNaN(parsedCommentId)) {
      throw new ValidationError("Invalid comment ID", {
        error: "Comment ID must be a valid number",
      });
    }

    const result: moderateCommentResult = await authModerateComment(
      req,
      campaignId,
      parsedCommentId,
    );

    if (result.type === "approved") {
      return NextResponse.json(
        {
          id: result.comment.id,
          user_id: result.comment.user_id,
          campaign_id: result.comment.campaign_id,
          text: result.comment.text,
          created_at: result.comment.created_at,
          visible: result.comment.visible,
          comment_approval: true,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        id: result.comment.id,
        user_id: result.comment.user_id,
        campaign_id: result.comment.campaign_id,
        comment_approval: false,
        deleted: true,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error("Unexpected error in comment moderation route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during comment moderation",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
