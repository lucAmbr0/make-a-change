import { NextRequest, NextResponse } from "next/server";
import { getUserBySession } from "@/lib/services/userService";
import {
  ApiError,
  InternalServerError,
} from "@/lib/errors/ApiError";
import { publicUserRowSchema } from "@/lib/schemas/users";

export async function GET(req: NextRequest) {
  try {
    const user: publicUserRowSchema = await getUserBySession(req);
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error("Unexpected error in /me route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred"
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}