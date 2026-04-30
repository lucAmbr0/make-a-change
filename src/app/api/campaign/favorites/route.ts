import {
  getUserFavoritesService,
  addFavoriteService,
  removeFavoriteService,
} from "@/lib/services/favoriteService";
import { route } from "@/lib/api/handler";

export const GET = route(async (ctx) => {
  return await getUserFavoritesService(ctx);
});

export const POST = route(async (ctx) => {
  return await addFavoriteService(ctx);
});

export const DELETE = route(async (ctx) => {
  await removeFavoriteService(ctx);
  return null;
});
