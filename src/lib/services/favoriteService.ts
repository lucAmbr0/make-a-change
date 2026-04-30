import { requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import { ConflictError, NotFoundError } from "../errors/ApiError";
import {
  addFavoriteInput,
  removeFavoriteInput,
} from "../schemas/favorites";
import {
  insertFavorite,
  deleteFavorite,
  getUserFavorites,
  favoriteExists,
} from "../db/favorites";
import { getCampaign, getCampaignUnauthorized } from "../db/campaigns";
import { isSuperUser } from "../auth/permissions";
import { parseBody } from "../api/body";

async function ensureCampaignVisible(
  ctx: RequestCtx,
  userId: number,
  campaignId: number,
) {
  const isAdmin = await isSuperUser(userId, ctx);
  const campaign = isAdmin
    ? await getCampaignUnauthorized({ campaign_id: campaignId })
    : await getCampaign({ user_id: userId, campaign_id: campaignId });

  if (!campaign) {
    throw new NotFoundError(
      "Campaign not found. Please ensure the campaign exists and you have access to it.",
    );
  }
  return campaign;
}

export async function getUserFavoritesService(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  return await getUserFavorites({ user_id: auth.userId });
}

export async function addFavoriteService(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, addFavoriteInput);

  await ensureCampaignVisible(ctx, auth.userId, input.campaign_id);

  const alreadyFavorited = await favoriteExists({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  if (alreadyFavorited) {
    throw new ConflictError("This campaign is already in your favorites.");
  }

  await insertFavorite({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  return { user_id: auth.userId, campaign_id: input.campaign_id };
}

export async function removeFavoriteService(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, removeFavoriteInput);

  await ensureCampaignVisible(ctx, auth.userId, input.campaign_id);

  const isFavorited = await favoriteExists({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  if (!isFavorited) {
    throw new NotFoundError("This campaign is not in your favorites.");
  }

  await deleteFavorite({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  return true;
}
