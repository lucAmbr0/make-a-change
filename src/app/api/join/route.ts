import { ApiError, InternalServerError } from "@/lib/errors/ApiError";
import { memberRowSchema } from "@/lib/schemas/members";
import { joinOrganizationWithInviteCode } from "@/lib/services/inviteCodeService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const member: memberRowSchema = await joinOrganizationWithInviteCode(req);

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
		if (error instanceof ApiError) {
			return NextResponse.json(error.toJSON(), { status: error.statusCode });
		}

		console.error("Unexpected error in join by invite code route:", error);
		const internalError = new InternalServerError(
			"An unexpected error occurred during join by invite code",
		);
		return NextResponse.json(internalError.toJSON(), { status: 500 });
	}
}
