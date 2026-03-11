import {
  ApiError,
  InternalServerError,
  ValidationError,
} from "@/lib/errors/ApiError";
import { signatureRowSchema } from "@/lib/schemas/signatures";
import {
  authGetCampaignSignaturesCount,
  signCampaign,
  unsignCampaign,
} from "@/lib/services/signatureService";
import { NextRequest, NextResponse } from "next/server";

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

    const signaturesCount = await authGetCampaignSignaturesCount(
      req,
      campaignId,
    );

    return NextResponse.json(
      {
        campaign_id: campaignId,
        signatures_count: signaturesCount,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error(
      "Unexpected error in campaign signatures count route:",
      error,
    );
    const internalError = new InternalServerError(
      "An unexpected error occurred during campaign signatures count",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
  //
}

export async function POST(
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

    const signature: signatureRowSchema = await signCampaign(req, campaignId);

    return NextResponse.json(
      {
        id: signature.id,
        signer_id: signature.signer_id,
        campaign_id: signature.campaign_id,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error(
      "Unexpected error in campaign signature creation route:",
      error,
    );
    const internalError = new InternalServerError(
      "An unexpected error occurred during campaign signature creation",
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

    await unsignCampaign(req, campaignId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error(
      "Unexpected error in campaign signature deletion route:",
      error,
    );
    const internalError = new InternalServerError(
      "An unexpected error occurred during campaign signature deletion",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }

  
}
