import { createHash } from "crypto";
import { getOptionalAuth, requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import {
  deleteSignatureByUserInCampaign,
  getAuthorizedCampaignSignaturesCount,
  getUserSignatureInCampaign,
  insertSignature,
} from "../db/signatures";
import { NotFoundError, ValidationError } from "../errors/ApiError";
import { signatureRowSchema } from "../schemas/signatures";
import { authGetCampaign } from "./campaignService";

function getSignatureChecksum(signerId: number, campaignId: number) {
  return createHash("sha256").update(`${signerId}:${campaignId}`).digest("hex");
}

export async function authGetCampaignSignaturesCount(
  ctx: RequestCtx,
  campaignId: number,
) {
  const auth = getOptionalAuth(ctx);

  const signaturesCount = await getAuthorizedCampaignSignaturesCount({
    user_id: auth.userId,
    campaign_id: campaignId,
  });

  if (signaturesCount === null) {
    throw new NotFoundError("Campaign not found.");
  }

  return signaturesCount;
}

export async function signCampaign(ctx: RequestCtx, campaignId: number) {
  const auth = requireAuthCtx(ctx);

  const campaign = await authGetCampaign(ctx, campaignId);
  if (!campaign) throw new NotFoundError("Campaign not found.");

  if (campaign.is_archived) {
    throw new ValidationError("Cannot sign an archived campaign", {
      campaign_id: campaignId,
    });
  }

  const existingSignature = await getUserSignatureInCampaign({
    signer_id: auth.userId,
    campaign_id: campaignId,
  });

  if (existingSignature) {
    throw new ValidationError("User has already signed this campaign", {
      campaign_id: campaignId,
      user_id: auth.userId,
    });
  }

  const signature: signatureRowSchema = await insertSignature({
    checksum: getSignatureChecksum(auth.userId, campaignId),
    signer_id: auth.userId,
    campaign_id: campaignId,
  });

  return signature;
}

export async function unsignCampaign(ctx: RequestCtx, campaignId: number) {
  const auth = requireAuthCtx(ctx);

  const campaign = await authGetCampaign(ctx, campaignId);
  if (!campaign) throw new NotFoundError("Campaign not found.");

  if (campaign.is_archived) {
    throw new ValidationError(
      "Cannot remove signature from an archived campaign",
      { campaign_id: campaignId },
    );
  }

  const existingSignature = await getUserSignatureInCampaign({
    signer_id: auth.userId,
    campaign_id: campaignId,
  });

  if (!existingSignature) throw new NotFoundError("Signature not found.");

  await deleteSignatureByUserInCampaign({
    signer_id: auth.userId,
    campaign_id: campaignId,
  });

  return true;
}
