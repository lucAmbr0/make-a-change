import { NextRequest, NextResponse } from "next/server"
import { createUserInput, userRowSchema } from "@/lib/schemas/users"
import { createUser } from "@/lib/services/userService"
import { ApiError, ValidationError, InternalServerError } from "@/lib/errors/ApiError"
import { ZodError } from "zod"

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let body: any;
    try {
      body = await req.json();
    } catch (error) {
      throw new ValidationError('Invalid JSON in request body', {
        error: 'Request body must be valid JSON',
      });
    }

    // Validate input against schema
    let input;
    try {
      input = createUserInput.parse(body);
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

    // Create user
    const user : userRowSchema = await createUser(input);

    // Return success response with 201 Created
    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          registered_at: user.registered_at,
          phone: user.phone,
          birth_date: user.birth_date,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle known API errors
    if (error instanceof ApiError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    // Handle unexpected errors
    console.error('Unexpected error in signup route:', error);
    const internalError = new InternalServerError(
      'An unexpected error occurred during user registration'
    );
    return NextResponse.json(internalError.toJSON(), { status: 500 });
  }
}