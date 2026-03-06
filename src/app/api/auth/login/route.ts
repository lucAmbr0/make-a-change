import { NextRequest, NextResponse } from "next/server"
import { userAuthenticationInput } from "@/lib/schemas/users"
import type { authenticatedUserSchema } from "@/lib/schemas/users"
import { loginUser } from "@/lib/services/userService"
import { setSessionCookie } from "@/lib/auth/auth"
import { ApiError, ValidationError, InternalServerError } from "@/lib/errors/ApiError"
import { ZodError } from "zod"

function getCorsHeaders(req?: NextRequest) {
  const origin = req?.headers.get("origin") ?? "http://localhost:3000";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body', {
        error: 'Request body must be valid JSON',
      });
    }

    let input;
    try {
      input = userAuthenticationInput.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError('Validation failed', {
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        });
      }
      throw error;
    }

    const user : authenticatedUserSchema = await loginUser(input);

    const response = NextResponse.json({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
    }, {
      headers: getCorsHeaders(req),
    });

    if (user.session_token) {
      setSessionCookie(response, user.session_token);
    }

    return response;
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error('Unexpected error in login route:', error);
    const internalError = new InternalServerError(
      'An unexpected error occurred during user login'
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}