import { NextRequest, NextResponse } from "next/server";
import {
  getUserNotificationsService,
  handleNotificationActionService,
} from "@/lib/services/notificationService";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";
import { notificationRowSchema } from "@/lib/schemas/notifications";

export async function GET(req: NextRequest) {
  try {
    const notifications: notificationRowSchema[] = await getUserNotificationsService(req);

    return NextResponse.json(
      notifications.map((n: notificationRowSchema) => ({
        id: n.id,
        target_user_id: n.target_user_id,
        title: n.title,
        text: n.text,
        is_read: n.is_read,
      })),
      { status: 200 },
    );
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in notification GET route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred while retrieving notifications",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await handleNotificationActionService(req, "read");

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in notification POST route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred while processing notification action",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const result = await handleNotificationActionService(req, "delete");

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error("Unexpected error in notification DELETE route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred while deleting notification",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
