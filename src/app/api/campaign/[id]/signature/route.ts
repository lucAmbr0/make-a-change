import {
  authGetCampaignSignaturesCount,
  signCampaign,
  unsignCampaign,
} from "@/lib/services/signatureService";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string };

export const GET = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  const signaturesCount = await authGetCampaignSignaturesCount(ctx, campaignId);
  return { campaign_id: campaignId, signatures_count: signaturesCount };
});

export const POST = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  const signature = await signCampaign(ctx, campaignId);
  return {
    id: signature.id,
    signer_id: signature.signer_id,
    campaign_id: signature.campaign_id,
  };
});

export const DELETE = route<Params>(async (ctx, { id }) => {
  const campaignId = parseIntParam(id, "campaign id");
  await unsignCampaign(ctx, campaignId);
  return null;
});
