import { NextRequest, NextResponse } from "next/server";
import {
  organizationResponseSchema,
  organizationRowSchema,
} from "@/lib/schemas/organization";
import {
  ApiError,
  InternalServerError,
  ValidationError,
} from "@/lib/errors/ApiError";
import {
  authGetOrganization,
  authDeleteOrganization,
  createOrganization,
  getAuthorizedOrganizations,
} from "@/lib/services/organizationService";

// Get Organization
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const organizationId = parseInt(id, 10);

    if (isNaN(organizationId)) {
      throw new ValidationError("Invalid organization ID", {
        error: "Organization ID must be a valid number",
      });
    }
    const organization: organizationResponseSchema = await authGetOrganization(
      req,
      organizationId,
    );
    return NextResponse.json({
      id: organization.id,
      name: organization.name,
      description: organization.description,
      creator_id: organization.creator_id,
      creator_first_name: organization.creator_first_name,
      creator_last_name: organization.creator_last_name,
      created_at: organization.created_at,
      cover_path: organization.cover_path,
      members_count: organization.members_count || 0,
      campaigns_count: organization.campaigns_count || 0,
      is_public: organization.is_public,
      requires_approval: organization.requires_approval
    }, { status: 200 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in organization list route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during organization list",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
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

// Organization Deletion
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const organizationId = parseInt(id, 10);

    if (isNaN(organizationId)) {
      throw new ValidationError("Invalid organization ID", {
        error: "Organization ID must be a valid number",
      });
    }

    await authDeleteOrganization(req, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in organization deletion route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during organization deletion",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
