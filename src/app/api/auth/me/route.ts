import { NextRequest, NextResponse } from "next/server";
import { getUserBySession } from "@/lib/services/userService";
import {
  ApiError,
  ValidationError,
  InternalServerError,
} from "@/lib/errors/ApiError";
import { ZodError } from "zod";
import { publicUserRowSchema } from "@/lib/schemas/users";

export async function GET(req: NextRequest) {
  try {
    const user : publicUserRowSchema = await getUserBySession(req);

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}