import { NextRequest, NextResponse } from "next/server";
import { campaignRowSchema } from "@/lib/schemas/campaigns";
import { createCampaign } from "@/lib/services/campaignService";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";

// Get Campaign list
export async function GET(req: NextRequest) {
    // todo
}

// Campaign Creation
export async function POST(req: NextRequest) {
  try {
    // Create campaign
    const campaign: campaignRowSchema = await createCampaign(req);

    // Return success response with 201 Created
    return NextResponse.json(
      {
        success: true,
        data: {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          cover_path: campaign.cover_path,
          signature_goal: campaign.signature_goal,
          is_public: campaign.is_public,
          comments_active: campaign.comments_active,
          comments_require_approval: campaign.comments_require_approval,
          created_at: campaign.created_at,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in campaign creation route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during campaign creation",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
