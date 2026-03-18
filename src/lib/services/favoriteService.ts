import { NextRequest } from "next/server";
import { requireAuth } from "../auth/auth";
import {
  ValidationError,
  NotFoundError,
  ConflictError
} from "../errors/ApiError";
import {
  addFavoriteInput,
  removeFavoriteInput
} from "../schemas/favorites";
import {
  insertFavorite,
  deleteFavorite,
  getUserFavorites,
  favoriteExists,
} from "../db/favorites";
import { getCampaign, getCampaignUnauthorized } from "../db/campaigns";
import { ZodError } from "zod";
import { isSuperUser } from "../auth/permissions";

export async function getUserFavoritesService(req: NextRequest) {
  const auth = requireAuth(req);

  const favorites = await getUserFavorites({ user_id: auth.userId });
  return favorites;
}

export async function addFavoriteService(req: NextRequest) {
  const auth = requireAuth(req);

  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  // Validate input against schema
  let input;
  try {
    input = addFavoriteInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  // Check if campaign exists and user is authorized to see it
  // For superusers, fetch without authorization filters
  // For regular users, fetch with authorization filters
  const isSuperUserFlag = auth.userId && await isSuperUser(auth.userId);
  let campaign;
  
  if (isSuperUserFlag) {
    campaign = await getCampaignUnauthorized({
      campaign_id: input.campaign_id,
    });
  } else {
    campaign = await getCampaign({
      user_id: auth.userId,
      campaign_id: input.campaign_id,
    });
  }

  if (!campaign) {
    throw new NotFoundError(
      "Campaign not found. Please ensure the campaign exists and you have access to it.",
    );
  }

  // Check if already in favorites
  const alreadyFavorited = await favoriteExists({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  if (alreadyFavorited) {
    throw new ConflictError(
      "This campaign is already in your favorites.",
    );
  }

  // Add to favorites
  await insertFavorite({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  return {
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  };
}

export async function removeFavoriteService(req: NextRequest) {
  const auth = requireAuth(req);

  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  // Validate input against schema
  let input;
  try {
    input = removeFavoriteInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  // Check if campaign exists and user is authorized to see it
  // For superusers, fetch without authorization filters
  // For regular users, fetch with authorization filters
  const isSuperUserFlag = auth.userId && await isSuperUser(auth.userId);
  let campaign;
  
  if (isSuperUserFlag) {
    campaign = await getCampaignUnauthorized({
      campaign_id: input.campaign_id,
    });
  } else {
    campaign = await getCampaign({
      user_id: auth.userId,
      campaign_id: input.campaign_id,
    });
  }

  if (!campaign) {
    throw new NotFoundError(
      "Campaign not found. Please ensure the campaign exists and you have access to it.",
    );
  }

  // Check if in favorites
  const isFavorited = await favoriteExists({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  if (!isFavorited) {
    throw new NotFoundError(
      "This campaign is not in your favorites.",
    );
  }

  // Remove from favorites
  await deleteFavorite({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  return true;
}
