import { comparePassword, hashPassword } from "../auth/hash";
import { insertUser, authenticateUser as authenticateUser } from "../db/users";
import { createUserInput, userAuthenticationInput } from "../schemas/users";
import {
  ConflictError,
  InternalServerError,
  BadRequestError,
  NotFoundError,
} from "../errors/ApiError";
import { DBError } from "../db/query";
import { signToken } from "../auth/auth";

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

export async function loginUser(input: userAuthenticationInput) {
  const authenticatedUser = await authenticateUser({
    email: input.email,
  });

  const passwordMatches = await comparePassword(
    input.password,
    authenticatedUser.password_hashed,
  );

  if (!passwordMatches) {
    throw new NotFoundError("Invalid credentials");
  }

  const token = signToken({ userId: authenticatedUser.id });

  if (!token) throw new InternalServerError("Error signing token")

  return {
    id: authenticatedUser.id,
    first_name: authenticatedUser.first_name,
    last_name: authenticatedUser.last_name,
    session_token: token,
  };
}
