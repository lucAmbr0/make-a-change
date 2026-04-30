import { createUserInput } from "@/lib/schemas/users";
import { createUser } from "@/lib/services/userService";
import { route } from "@/lib/api/handler";
import { parseBody } from "@/lib/api/body";

export const POST = route(async (ctx) => {
  const input = await parseBody(ctx, createUserInput);
  const user = await createUser(input);

  return {
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
  };
});
