import {
	ApiError,
	InternalServerError,
	ValidationError,
} from "@/lib/errors/ApiError";
import {
	authDeleteComment,
	authGetCampaignComments,
	createComment,
} from "@/lib/services/commentService";
import { commentResponseSchema, commentRowSchema } from "@/lib/schemas/comments";
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

		const comments: commentResponseSchema[] = await authGetCampaignComments(
			req,
			campaignId,
		);

		return NextResponse.json(
			comments.map((c: commentResponseSchema) => {
				return {
					id: c.id,
					user_id: c.user_id,
					campaign_id: c.campaign_id,
					user_first_name: c.user_first_name,
					user_last_name: c.user_last_name,
					text: c.text,
					created_at: c.created_at,
					visible: c.visible,
				};
			}),
			{ status: 200 },
		);
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(error.toJSON(), { status: error.statusCode });
		}

		console.error("Unexpected error in campaign comments list route:", error);
		const internalError = new InternalServerError(
			"An unexpected error occurred during campaign comments list",
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
		const campaignId = parseInt(id, 10);

		if (isNaN(campaignId)) {
			throw new ValidationError("Invalid campaign ID", {
				error: "Campaign ID must be a valid number",
			});
		}

		const comment: commentRowSchema = await createComment(req, campaignId);

		return NextResponse.json(
			{
				id: comment.id,
				user_id: comment.user_id,
				campaign_id: comment.campaign_id,
				text: comment.text,
				created_at: comment.created_at,
				visible: comment.visible,
			},
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(error.toJSON(), { status: error.statusCode });
		}

		console.error("Unexpected error in campaign comment creation route:", error);
		const internalError = new InternalServerError(
			"An unexpected error occurred during campaign comment creation",
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

		await authDeleteComment(req, campaignId);
		return new NextResponse(null, { status: 204 });
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(error.toJSON(), { status: error.statusCode });
		}

		console.error("Unexpected error in campaign comment deletion route:", error);
		const internalError = new InternalServerError(
			"An unexpected error occurred during campaign comment deletion",
		);
		return NextResponse.json(internalError.toJSON(), { status: 500 });
	}
}

