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
          return {
            id: c.id,
            title: c.title,
            description: c.description,
            cover_path: c.cover_path,
            signature_goal: c.signature_goal,
            is_public: c.is_public,
            comments_active: c.comments_active,
            comments_require_approval: c.comments_require_approval,
            created_at: c.created_at,
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

    // Return success response with 201 Created
    return NextResponse.json(
      {
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

export async function DELETE(req: NextRequest) {
  try {
    // Delete campaign
    const result = await authDeleteCampaign(req);

    // Return success response with 201 Created
    return NextResponse.json(
      result,
      { status: 204 },
    );
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