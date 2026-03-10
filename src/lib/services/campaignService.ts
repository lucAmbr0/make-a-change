import { NextRequest } from "next/server";
import { getTokenFromRequest, requireAuth } from "../auth/auth";
import { UnauthorizedError, ValidationError, NotFoundError } from "../errors/ApiError";
import { campaignIdRowSchema, campaignRowSchema, createCampaignInput } from "../schemas/campaigns";
import { checkDeleteCampaignPrivileges, deleteCampaign, getCampaignsForUser, insertCampaign, campaignExists } from "../db/campaigns";
import { ZodError } from "zod";
import { isMember } from "./memberService";

export async function createCampaign(req: NextRequest) {
  const auth = requireAuth(req);

  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  // Validate input against schema
  let input;
  try {
    input = createCampaignInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  // Validate organization membership if organization_id is provided
  if (input.organization_id) {
    const member = await isMember(auth.userId, input.organization_id);
    if (!member) {
      throw new UnauthorizedError(
        "Can't create a campaign inside an organization you're not a member of",
      );
    }
  }

  const creation_date = new Date();

  const campaign: campaignRowSchema = await insertCampaign({
    organization_id: input.organization_id || null,
    creator_id: auth.userId,
    title: input.title,
    description: input.description || null,
    created_at: creation_date,
    cover_path: input.cover_path || null,
    signature_goal: input.signature_goal || null,
    is_public: input.is_public,
    comments_active: input.comments_active,
    comments_require_approval: input.comments_require_approval,
  });

  return campaign;
}

export async function getAuthorizedCampaings(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const auth = token ? requireAuth(req) : { userId: null };
  let campaigns: campaignRowSchema[];
  campaigns = await getCampaignsForUser({ user_id: auth.userId });
  return campaigns;
}

export async function authDeleteCampaign(req: NextRequest, campaignId: number) {
  const auth = requireAuth(req);

  // First check if campaign exists
  const exists = await campaignExists({ campaign_id: campaignId });
  if (!exists) {
    throw new NotFoundError("Campaign not found.", {
      operation: "authDeleteCampaign",
      campaignId: campaignId,
    });
  }

  // Then check if user owns it
  const hasPrivileges = await checkDeleteCampaignPrivileges({ user_id: auth.userId, campaign_id: campaignId });
  if (!hasPrivileges) {
    throw new UnauthorizedError("You don't have permission to delete this campaign.");
  }

  // Delete the campaign
  await deleteCampaign({ id: campaignId });
  return true;
}