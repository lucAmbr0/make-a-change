import zod from "zod";

export const favoriteRowSchema = zod.object({
  user_id: zod.number().int(),
  campaign_id: zod.number().int(),
});

export type favoriteRowSchema = zod.infer<typeof favoriteRowSchema>;

export const addFavoriteInput = zod.object({
  campaign_id: zod
    .number({ message: "Campaign ID is required" })
    .int("Campaign ID must be an integer")
    .positive("Campaign ID must be a positive number"),
});

export type addFavoriteInput = zod.infer<typeof addFavoriteInput>;

export const removeFavoriteInput = zod.object({
  campaign_id: zod
    .number({ message: "Campaign ID is required" })
    .int("Campaign ID must be an integer")
    .positive("Campaign ID must be a positive number"),
});

export type removeFavoriteInput = zod.infer<typeof removeFavoriteInput>;

export const favoriteCampaignResponseSchema = zod.object({
  id: zod.number().int(),
  title: zod.string().max(64),
});

export type favoriteCampaignResponseSchema = zod.infer<
  typeof favoriteCampaignResponseSchema
>;
