import { query } from "./query";
import { userRowSchema } from "../schemas/users";

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

  return rows[0];
}

export async function deleteUser(data: {
  id: number,
  email: string,
  password_hashed: string,
}) {
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

  return rows[0];
}