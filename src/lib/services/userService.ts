import { hashPassword } from "../auth/hash";
import { insertUser } from "../db/users";
import { createUserInput } from "../schemas/users";

export async function createUser(input: createUserInput) {
  const password_hashed: string = await hashPassword(input.password);
  const registered_at = new Date();

  return insertUser({
    first_name: input.first_name,
    last_name: input.last_name,
    email: input.email,
    password_hashed: password_hashed,
    registered_at: registered_at,
    phone: input.phone,
    birth_date: input.birth_date,
    is_active: 1,
    is_admin: 0
  });
}
