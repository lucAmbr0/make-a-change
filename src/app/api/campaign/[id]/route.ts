import { InternalServerError } from "@/lib/errors/ApiError";
import { authDeleteCampaign, authGetCampaign } from "@/lib/services/campaignService";
import { ApiError, ValidationError } from "@/lib/errors/ApiError";
import { NextRequest, NextResponse } from "next/server";
import { campaignResponseSchema, campaignRowSchema } from "@/lib/schemas/campaigns";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id, 10);

    if (isNaN(campaignId)) {
      throw new ValidationError("Invalid campaign ID", {
        error: "Campaign ID must be a valid number",
      });
    }

    const campaign : campaignResponseSchema = await authGetCampaign(req, campaignId);
    return NextResponse.json({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      cover_path: campaign.cover_path,
      creator_id: campaign.creator_id,
      creator_first_name: campaign.creator_first_name,
      creator_last_name: campaign.creator_last_name,
      created_at: campaign.created_at,
      organization_id: campaign.organization_id,
      organization_name: campaign.organization_name,
      signature_goal: campaign.signature_goal,
      is_public: campaign.is_public,
      comments_active: campaign.comments_active,
      comments_require_approval: campaign.comments_require_approval
    }, { status: 200 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in campaign deletion route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during campaign deletion",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id, 10);

    if (isNaN(campaignId)) {
      throw new ValidationError("Invalid campaign ID", {
        error: "Campaign ID must be a valid number",
      });
    }

    await authDeleteCampaign(req, campaignId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in campaign deletion route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during campaign deletion",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
