import {
  getUserRepostsService,
  addRepostService,
  removeRepostService,
} from "@/lib/services/repostService";
import { route } from "@/lib/api/handler";

export const GET = route(async (ctx) => {
  return await getUserRepostsService(ctx);
});

export const POST = route(async (ctx) => {
  return await addRepostService(ctx);
});

export const DELETE = route(async (ctx) => {
  await removeRepostService(ctx);
  return null;
});
