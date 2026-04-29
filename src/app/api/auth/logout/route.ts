import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/auth";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";

export async function POST(_req: NextRequest) {
  try {
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    console.error("Unexpected error in logout route:", error);
    const internalError = new InternalServerError(
      "An unexpected error occurred during user logout",
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}
