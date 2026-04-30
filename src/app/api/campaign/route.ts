import {
  createCampaign,
  getAuthorizedCampaignsWithDetails,
} from "@/lib/services/campaignService";
import { route } from "@/lib/api/handler";

export const GET = route(async (ctx) => {
  return await getAuthorizedCampaignsWithDetails(ctx);
});

export const POST = route(async (ctx) => {
  return await createCampaign(ctx);
});
