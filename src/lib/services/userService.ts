import { comparePassword, hashPassword } from "../auth/hash";
import { insertUser, getUserByEmail, getUserById } from "../db/users";
import {
  createUserInput,
  publicUserRowSchema,
  userAuthenticationInput,
} from "../schemas/users";
import { requireAuth } from "../auth/auth";
import {
  ConflictError,
  InternalServerError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/ApiError";
import { DBError } from "../db/query";
import { signToken } from "../auth/auth";
import { NextRequest } from "next/server";

export async function createUser(input: createUserInput) {
  let password_hashed: string;
  try {
    password_hashed = await hashPassword(input.password);
  } catch (error) {
    console.error("Password hashing failed:", error);
    throw new InternalServerError("Failed to process password", {
      stage: "password_hashing",
    });
  }

  const registered_at = new Date();

  try {
    return await insertUser({
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      email: input.email,
      password_hashed: password_hashed,
      registered_at: registered_at,
      phone: input.phone?.trim() || null,
      birth_date: input.birth_date,
      is_active: 1,
      is_admin: 0,
    });
  } catch (error) {
    if (error instanceof DBError) {
      if (error.code === "ER_DUP_ENTRY" && error.message.includes("email")) {
        throw new ConflictError("An account with this email already exists", {
          field: "email",
          value: input.email,
        });
      }

      if (error.kind === "constraint") {
        throw new BadRequestError("Database constraint violation", {
          code: error.code,
          details: error.message,
        });
      }

      if (error.kind === "connection") {
        throw new InternalServerError("Database connection failed", {
          stage: "database_insert",
        });
      }

      console.error("Database error during user creation:", error);
      throw new InternalServerError("Failed to create user account", {
        stage: "database_insert",
      });
    }
    throw error;
  }
}

export async function getUserBySession(req: NextRequest) {
  const auth = requireAuth(req);

  if (!auth || !auth.userId) {
    throw new BadRequestError("Invalid session");
  }

  const fullUser = await getUserById(auth);

  const user: publicUserRowSchema = {
    id: fullUser.id,
    first_name: fullUser.first_name,
    last_name: fullUser.last_name,
    email: fullUser.email,
    phone: fullUser.phone,
    birth_date: fullUser.birth_date
  };

  return user;
}

export async function loginUser(input: userAuthenticationInput) {
  const user = await getUserByEmail({
    email: input.email,
  });

  const passwordMatches = await comparePassword(
    input.password,
    user.password_hashed,
  );

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const token = signToken({ userId: user.id });

  if (!token) throw new InternalServerError("Error signing token");

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    session_token: token,
  };
}
