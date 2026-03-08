import { NextRequest } from "next/server";
import { requireAuth } from "../auth/auth";
import { UnauthorizedError, ValidationError } from "../errors/ApiError";
import { campaignRowSchema, createCampaignInput } from "../schemas/campaigns";
import { insertCampaign } from "../db/campaigns";
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
