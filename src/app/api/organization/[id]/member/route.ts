import { NextRequest, NextResponse } from "next/server";
import { memberResponseSchema, memberRowSchema } from "@/lib/schemas/members";
import {
  ApiError,
  InternalServerError,
  ValidationError,
} from "@/lib/errors/ApiError";
import { addMember, authGetMembersCount, authGetMembersList, authDeleteMember } from "@/lib/services/memberService";

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
    const members: number = await authGetMembersCount(
      req,
      organizationId,
    );
    return NextResponse.json(
      {
        organization_id: organizationId,
        members_count: members,
      },
      { status: 200 },
    );
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

// Get Members list
// export async function GET(
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   try {
//     const { id } = await params;
//     const organizationId = parseInt(id, 10);

//     if (isNaN(organizationId)) {
//       throw new ValidationError("Invalid organization ID", {
//         error: "Organization ID must be a valid number",
//       });
//     }
//     const members: memberResponseSchema[] = await authGetMembersList(
//       req,
//       organizationId,
//     );
//     return NextResponse.json(
//       {
//         organization_id: organizationId,
//         members: members.map((m: memberResponseSchema) => {
//           return {
//             user_id: m.user_id,
//             user_first_name: m.user_first_name,
//             user_last_name: m.user_last_name,
//             is_moderator: m.is_moderator,
//             is_owner: m.is_owner,
//           };
//         }),
//       },
//       { status: 200 },
//     );
//   } catch (error) {
//     // Handle known API errors
//     if (error instanceof ApiError) {
//       return NextResponse.json(error.toJSON(), { status: error.statusCode });
//     }

//     // Handle unexpected errors
//     console.error("Unexpected error in organization list route:", error);
//     const internalError = new InternalServerError(
//       "An unexpected error occurred during organization list",
//     );
//     return NextResponse.json(internalError.toJSON(), { status: 500 });
//   }
// }

// Member Creation
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

    // Create Member
    const member: memberRowSchema = await addMember(req, organizationId);

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

// Member Deletion
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

    await authDeleteMember(req, organizationId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in Member deletion route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during Member deletion",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
