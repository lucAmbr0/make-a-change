import { authModerateComment } from "@/lib/services/commentService";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string; commentId: string };

export const POST = route<Params>(async (ctx, { id, commentId }) => {
  const campaignId = parseIntParam(id, "campaign id");
  const parsedCommentId = parseIntParam(commentId, "comment id");

  const result = await authModerateComment(ctx, campaignId, parsedCommentId);

  if (result.type === "approved") {
    return {
      id: result.comment.id,
      user_id: result.comment.user_id,
      campaign_id: result.comment.campaign_id,
      text: result.comment.text,
      created_at: result.comment.created_at,
      visible: result.comment.visible,
      comment_approval: true,
    };
  }

  return {
    id: result.comment.id,
    user_id: result.comment.user_id,
    campaign_id: result.comment.campaign_id,
    comment_approval: false,
    deleted: true,
  };
});
