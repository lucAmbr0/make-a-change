import { NextRequest, NextResponse } from "next/server";
import { memberRowSchema } from "@/lib/schemas/members";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";
import { addMember } from "@/lib/services/memberService";

// Get Members list
export async function GET(req: NextRequest) {
  // todo
}

// Member Creation
export async function POST(req: NextRequest) {
  try {
    // Create Member
    const member: memberRowSchema = await addMember(req);

    // Return success response with 201 Created
    return NextResponse.json(
      {
        organization_id: member.organization_id,
        user_id: member.user_id,
        is_moderator: member.is_moderator,
        is_owner: member.is_owner,
      },
      { status: 201 },
    );
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in Member creation route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during Member creation",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
