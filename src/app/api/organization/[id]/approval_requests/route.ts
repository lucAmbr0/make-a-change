import {
	ApiError,
	InternalServerError,
	ValidationError,
} from "@/lib/errors/ApiError";
import {
	authGetApprovalRequests,
	resolveApprovalRequest,
} from "@/lib/services/approvalRequestService";
import {
	approvalRequestResponseSchema,
	approvalRequestRowSchema,
} from "@/lib/schemas/approval_requests";
import { memberRowSchema } from "@/lib/schemas/members";
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

		const approvalRequests: approvalRequestResponseSchema[] =
			await authGetApprovalRequests(req, organizationId);

		return NextResponse.json(
			approvalRequests.map((approvalRequest: approvalRequestResponseSchema) => ({
				user_id: approvalRequest.user_id,
				organization_id: approvalRequest.organization_id,
				requested_at: approvalRequest.requested_at,
				user_first_name: approvalRequest.user_first_name,
				user_last_name: approvalRequest.user_last_name,
			})),
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(error.toJSON(), { status: error.statusCode });
		}

		console.error("Unexpected error in approval requests list route:", error);
		const internalError = new InternalServerError(
			"An unexpected error occurred during approval requests list",
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

		const result = await resolveApprovalRequest(req, organizationId);

		if (result.type === "approved") {
			const member: memberRowSchema = result.member;

			return NextResponse.json(
				{
					organization_id: member.organization_id,
					user_id: member.user_id,
					is_moderator: member.is_moderator,
					is_owner: member.is_owner,
				},
				{ status: 201 },
			);
		}

		const approvalRequest: approvalRequestRowSchema = result.approvalRequest;

		return NextResponse.json(
			{
				organization_id: approvalRequest.organization_id,
				user_id: approvalRequest.user_id,
				requested_at: approvalRequest.requested_at,
				approval: false,
			},
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(error.toJSON(), { status: error.statusCode });
		}

		console.error("Unexpected error in approval request resolution route:", error);
		const internalError = new InternalServerError(
			"An unexpected error occurred during approval request resolution",
		);
		return NextResponse.json(internalError.toJSON(), { status: 500 });
	}
}
