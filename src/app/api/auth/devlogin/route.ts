import { NextRequest, NextResponse } from "next/server";
import type { authenticatedUserSchema } from "@/lib/schemas/users";
import { loginUser } from "@/lib/services/userService";
import { setSessionCookie } from "@/lib/auth/auth";
import { ApiError, InternalServerError } from "@/lib/errors/ApiError";

export async function GET(req: NextRequest) {
	try {
		// Internal preview shortcut login for local testing.
		const user: authenticatedUserSchema = await loginUser({
			email: "alice1@example.com",
			password: "Password1",
		});

		const response = NextResponse.redirect(new URL("/", req.url));

		if (user.session_token) {
			setSessionCookie(response, user.session_token);
		}

		return response;
	} catch (error) {
		if (error instanceof ApiError) {
			return NextResponse.json(error.toJSON(), { status: error.statusCode });
		}

		console.error("Unexpected error in devlogin route:", error);
		const internalError = new InternalServerError(
			"An unexpected error occurred during dev login",
		);
		return NextResponse.json(internalError.toJSON(), { status: 500 });
	}
}