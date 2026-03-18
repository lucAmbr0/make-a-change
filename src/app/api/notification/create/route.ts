import { NextRequest, NextResponse } from "next/server";
import { createNotificationService } from "@/lib/services/notificationService";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";

/**
 * POST /api/notification/create
 * Creates notifications for users
 * Only accessible to admin users
 *
 * Body types:
 * { type: "user", target_user_id: number, title: string, text: string }
 * { type: "organization", organization_id: number, title: string, text: string }
 * { type: "campaign_signers", campaign_id: number, title: string, text: string }
 * { type: "all_users", title: string, text: string }
 */
export async function POST(req: NextRequest) {
  try {
    const result = await createNotificationService(req);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in notification creation route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred while creating notifications",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
