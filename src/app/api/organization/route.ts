import { NextRequest, NextResponse } from "next/server";
import { organizationRowSchema } from "@/lib/schemas/organization";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";
import { createOrganization } from "@/lib/services/organizationService";

// Get Organizations list
export async function GET(req: NextRequest) {
  // todo
}

// Organization Creation
export async function POST(req: NextRequest) {
  try {
    // Create Organization
    const organization: organizationRowSchema = await createOrganization(req);

    // Return success response with 201 Created
    return NextResponse.json(
      {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        cover_path: organization.cover_path,
        created_at: organization.created_at,
        is_public: organization.is_public,
        requires_approval: organization.requires_approval,
      },
      { status: 201 },
    );
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in organization creation route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during organization creation",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
