import {
  authDeleteComment,
  authGetCampaignComments,
  createComment,
} from "@/lib/services/commentService";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string };

export const GET = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  return await authGetCampaignComments(ctx, campaignId);
});

export const POST = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  return await createComment(ctx, campaignId);
});

export const DELETE = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  await authDeleteComment(ctx, campaignId);
  return null;
});
