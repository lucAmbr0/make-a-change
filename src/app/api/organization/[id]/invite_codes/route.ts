import {
  ApiError,
  InternalServerError,
  ValidationError,
} from "@/lib/errors/ApiError";
import { inviteCodeRowSchema } from "@/lib/schemas/invite_codes";
import {
  authDeleteInviteCode,
  authGetInviteCodes,
  createInviteCode,
} from "@/lib/services/inviteCodeService";
import { NextRequest, NextResponse } from "next/server";

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

    const inviteCodes: inviteCodeRowSchema[] = await authGetInviteCodes(
      req,
      organizationId,
    );

    return NextResponse.json(
      inviteCodes.map((c: inviteCodeRowSchema) => ({
        id: c.id,
        organization_id: c.organization_id,
        code: c.code,
        uses: c.uses,
        expires_at: c.expires_at,
      })),
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error("Unexpected error in invite codes list route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during invite codes list",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}

export async function POST(
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

    const inviteCode: inviteCodeRowSchema = await createInviteCode(
      req,
      organizationId,
    );

    return NextResponse.json(
      {
        id: inviteCode.id,
        organization_id: inviteCode.organization_id,
        code: inviteCode.code,
        uses: inviteCode.uses,
        expires_at: inviteCode.expires_at,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error("Unexpected error in invite code creation route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during invite code creation",
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
    const organizationId = parseInt(id, 10);

    if (isNaN(organizationId)) {
      throw new ValidationError("Invalid organization ID", {
        error: "Organization ID must be a valid number",
      });
    }

    await authDeleteInviteCode(req, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error("Unexpected error in invite code deletion route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during invite code deletion",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
