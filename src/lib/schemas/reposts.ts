import zod from "zod";

export const repostRowSchema = zod.object({
  user_id: zod.number().int(),
  campaign_id: zod.number().int(),
});

export type repostRowSchema = zod.infer<typeof repostRowSchema>;

export const addRepostInput = zod.object({
  campaign_id: zod
    .number({ message: "Campaign ID is required" })
    .int("Campaign ID must be an integer")
    .positive("Campaign ID must be a positive number"),
});

export type addRepostInput = zod.infer<typeof addRepostInput>;

export const removeRepostInput = zod.object({
  campaign_id: zod
    .number({ message: "Campaign ID is required" })
    .int("Campaign ID must be an integer")
    .positive("Campaign ID must be a positive number"),
});

export type removeRepostInput = zod.infer<typeof removeRepostInput>;

export const repostCampaignResponseSchema = zod.object({
  id: zod.number().int(),
  title: zod.string().max(64),
});

export type repostCampaignResponseSchema = zod.infer<
  typeof repostCampaignResponseSchema
>;
