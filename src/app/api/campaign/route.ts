import { NextRequest, NextResponse } from "next/server";
import { campaignRowSchema } from "@/lib/schemas/campaigns";
import {
  authDeleteCampaign,
  createCampaign,
  getAuthorizedCampaings,
} from "@/lib/services/campaignService";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";

// Get Campaign list
export async function GET(req: NextRequest) {
  try {
    const campaigns: campaignRowSchema[] = await getAuthorizedCampaings(req);
    return NextResponse.json(
      campaigns.map(
        (c: campaignRowSchema) => {
          const parsedCampaign = campaignRowSchema.parse(c);
          return {
            id: parsedCampaign.id,
            title: parsedCampaign.title,
            description: parsedCampaign.description,
            cover_path: parsedCampaign.cover_path,
            signature_goal: parsedCampaign.signature_goal,
            is_public: parsedCampaign.is_public,
            comments_active: parsedCampaign.comments_active,
            comments_require_approval: parsedCampaign.comments_require_approval,
            is_archived: parsedCampaign.is_archived,
            created_at: parsedCampaign.created_at,
          };
        },
      ),
      { status: 200 },
    );
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in campaign list route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during campaign list",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}

// Campaign Creation
export async function POST(req: NextRequest) {
  try {
    // Create campaign
    const campaign: campaignRowSchema = await createCampaign(req);
    const parsedCampaign = campaignRowSchema.parse(campaign);

    // Return success response with 201 Created
    return NextResponse.json(
      {
        id: parsedCampaign.id,
        title: parsedCampaign.title,
        description: parsedCampaign.description,
        cover_path: parsedCampaign.cover_path,
        signature_goal: parsedCampaign.signature_goal,
        is_public: parsedCampaign.is_public,
        comments_active: parsedCampaign.comments_active,
        comments_require_approval: parsedCampaign.comments_require_approval,
        is_archived: parsedCampaign.is_archived,
        created_at: parsedCampaign.created_at,
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