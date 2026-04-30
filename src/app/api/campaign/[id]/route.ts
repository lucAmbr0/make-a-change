import {
  authDeleteCampaign,
  authGetCampaign,
  authUpdateCampaign,
} from "@/lib/services/campaignService";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string };

export const GET = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  return await authGetCampaign(ctx, campaignId);
});

export const PATCH = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  return await authUpdateCampaign(ctx, campaignId);
});

export const DELETE = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  await authDeleteCampaign(ctx, campaignId);
  return null;
});
