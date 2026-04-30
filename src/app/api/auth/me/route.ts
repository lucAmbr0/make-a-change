import { getUserBySession } from "@/lib/services/userService";
import { route } from "@/lib/api/handler";

export const GET = route(async (ctx) => {
  return await getUserBySession(ctx);
});
