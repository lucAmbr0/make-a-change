import { query, DBError } from "./query";
import { userRowSchema } from "../schemas/users";
import { InternalServerError, NotFoundError } from "../errors/ApiError";

export async function insertUser(data: {
  first_name: string,
  last_name: string,
  email: string,
  password_hashed: string,
  registered_at: Date,
  phone: string | null | undefined,
  birth_date: Date,
  is_active: number,
  is_admin: number
}) {
  try {
    const rows = await query<userRowSchema>(
      `
      INSERT INTO users
        (
          first_name,
          last_name,
          email,
          password_hashed,
          registered_at,
          phone,
          birth_date,
          is_active,
          is_admin
        )
      VALUES (?,?,?,?,?,?,?,?,?)
      RETURNING *
      `,
      [
        data.first_name,
        data.last_name,
        data.email,
        data.password_hashed,
        data.registered_at,
        data.phone,
        data.birth_date,
        data.is_active,
        data.is_admin,
      ],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError('User creation failed: no rows returned', {
        operation: 'insertUser',
      });
    }

    return rows[0];
  } catch (error) {
    // Re-throw DBError to be handled by the service layer
    if (error instanceof DBError) {
      throw error;
    }
    // Wrap unexpected errors
    console.error('Unexpected error in insertUser:', error);
    throw new InternalServerError('Failed to insert user into database', {
      operation: 'insertUser',
    });
  }
}

export async function deleteUser(data: {
  id: number,
  email: string,
  password_hashed: string,
}) {
  try {
    const rows = await query<userRowSchema>(
      `
      DELETE FROM users
      WHERE id = ? AND email = ? and password_hashed = ?
      RETURNING *
      `,
      [
        data.id,
        data.email,
        data.password_hashed,
      ],
    );

    if (!rows || rows.length === 0) {
      throw new NotFoundError('User not found or credentials do not match', {
        operation: 'deleteUser',
        userId: data.id,
      });
    }

    return rows[0];
  } catch (error) {
    // Re-throw known errors
    if (error instanceof DBError || error instanceof NotFoundError) {
      throw error;
    }
    // Wrap unexpected errors
    console.error('Unexpected error in deleteUser:', error);
    throw new InternalServerError('Failed to delete user from database', {
      operation: 'deleteUser',
    });
  }
}