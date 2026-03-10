import { InternalServerError } from "@/lib/errors/ApiError";
import { authDeleteCampaign } from "@/lib/services/campaignService";
import { ApiError, ValidationError } from "@/lib/errors/ApiError";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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