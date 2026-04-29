import { NextRequest, NextResponse } from "next/server";
import { ApiError, InternalServerError, ValidationError } from "@/lib/errors/ApiError";
import { getMember } from "@/lib/services/memberService";
import { requireAuth } from "@/lib/auth/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const organizationId = parseInt(id, 10);

    if (isNaN(organizationId)) {
      throw new ValidationError("Invalid organization ID", {
        error: "Organization ID must be a valid number",
      });
    }

    const auth = requireAuth(req);
    const member = await getMember(auth.userId, organizationId);

    if (!member) {
      return NextResponse.json({ is_member: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        is_member: true,
        user_id: member.user_id,
        is_moderator: Boolean(member.is_moderator),
        is_owner: Boolean(member.is_owner),
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error("Unexpected error in organization member me route:", error);
    const internalError = new InternalServerError("An unexpected error occurred");
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
