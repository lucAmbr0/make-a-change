import { hashPassword } from "../auth/hash";
import { insertUser } from "../db/users";
import { createUserInput } from "../schemas/users";
import { ConflictError, InternalServerError, BadRequestError } from "../errors/ApiError";
import { DBError } from "../db/query";

export async function createUser(input: createUserInput) {

  const normalizedEmail = input.email.toLowerCase().trim();
  let password_hashed: string;
  try {
    password_hashed = await hashPassword(input.password);
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new InternalServerError('Failed to process password', {
      stage: 'password_hashing',
    });
  }

  const registered_at = new Date();

  try {
    return await insertUser({
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      email: normalizedEmail,
      password_hashed: password_hashed,
      registered_at: registered_at,
      phone: input.phone?.trim() || null,
      birth_date: input.birth_date,
      is_active: 1,
      is_admin: 0
    });
  } catch (error) {
    if (error instanceof DBError) {
      if (error.code === 'ER_DUP_ENTRY' && error.message.includes('email')) {
        throw new ConflictError('An account with this email already exists', {
          field: 'email',
          value: normalizedEmail,
        });
      }

      if (error.kind === 'constraint') {
        throw new BadRequestError('Database constraint violation', {
          code: error.code,
          details: error.message,
        });
      }

      if (error.kind === 'connection') {
        throw new InternalServerError('Database connection failed', {
          stage: 'database_insert',
        });
      }

      console.error('Database error during user creation:', error);
      throw new InternalServerError('Failed to create user account', {
        stage: 'database_insert',
      });
    }
    throw error;
  }
}
