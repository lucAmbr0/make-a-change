import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { getTokenFromRequest, requireAuth } from "../auth/auth";
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
  req: NextRequest,
  campaignId: number,
) {
  const token = getTokenFromRequest(req);
  const auth = token ? requireAuth(req) : { userId: null };

  const signaturesCount = await getAuthorizedCampaignSignaturesCount({
    user_id: auth.userId,
    campaign_id: campaignId,
  });

  if (signaturesCount === null) {
    throw new NotFoundError("Campaign not found.");
  }

  return signaturesCount;
}

export async function signCampaign(req: NextRequest, campaignId: number) {
  const auth = requireAuth(req);

  const campaign = await authGetCampaign(req, campaignId);
  if (!campaign || campaign === null) {
    throw new NotFoundError("Campaign not found.");
  }

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

export async function unsignCampaign(req: NextRequest, campaignId: number) {
  const auth = requireAuth(req);

  const campaign = await authGetCampaign(req, campaignId);
  if (!campaign || campaign === null) {
    throw new NotFoundError("Campaign not found.");
  }

  if (campaign.is_archived) {
    throw new ValidationError(
      "Cannot remove signature from an archived campaign",
      {
        campaign_id: campaignId,
      },
    );
  }

  const existingSignature = await getUserSignatureInCampaign({
    signer_id: auth.userId,
    campaign_id: campaignId,
  });

  if (!existingSignature) {
    throw new NotFoundError("Signature not found.");
  }

  await deleteSignatureByUserInCampaign({
    signer_id: auth.userId,
    campaign_id: campaignId,
  });

  return true;
}
