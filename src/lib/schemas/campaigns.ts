import zod, { number } from "zod";

const mysqlBooleanSchema = zod
  .union([zod.boolean(), zod.literal(0), zod.literal(1)])
  .transform((value) => value === true || value === 1);

export const campaignRowSchema = zod.object({
  id: zod.number().int(),
  organization_id: zod.number().int().nullable().optional(),
  creator_id: zod.number().int(),
  title: zod.string().max(64),
  description: zod.string().nullable().optional(),
  created_at: zod.coerce.date(),
  cover_path: zod.string().max(2048).nullable().optional(),
  signature_goal: zod.number().int().nullable().optional(),
  is_public: mysqlBooleanSchema,
  comments_active: mysqlBooleanSchema,
  comments_require_approval: mysqlBooleanSchema,
  is_archived: mysqlBooleanSchema,
});

export type campaignRowSchema = zod.infer<typeof campaignRowSchema>;

export const campaignResponseSchema = zod.object({
  id: zod.number().int(),
  organization_id: zod.number().int().nullable().optional(),
  organization_name: zod.string().max(64).nullable().optional(),
  signatures: zod.number().int().nonnegative(),
  creator_id: zod.number().int(),
  creator_first_name: zod.string().max(32).nullable().optional(),
  creator_last_name: zod.string().max(32).nullable().optional(),
  title: zod.string().max(64),
  description: zod.string().nullable().optional(),
  created_at: zod.coerce.date(),
  cover_path: zod.string().max(2048).nullable().optional(),
  signature_goal: zod.number().int().nullable().optional(),
  is_public: mysqlBooleanSchema,
  comments_active: mysqlBooleanSchema,
  comments_require_approval: mysqlBooleanSchema,
  is_archived: mysqlBooleanSchema,
});

export type campaignResponseSchema = zod.infer<typeof campaignResponseSchema>;

export const createCampaignInput = zod.object({
  organization_id: zod.number().int().nullable().optional(),
  title: zod
    .string({ message: "Title is required" })
    .min(1, "Title cannot be empty")
    .max(64, "Title cannot exceed 64 characters")
    .trim(),
  description: zod
    .string({ message: "Description must be a string" })
    .max(65535, "Description is too long")
    .nullable()
    .optional(),
  cover_path: zod
    .string({ message: "Cover path must be a string" })
    .max(2048, "Cover path cannot exceed 2048 characters")
    .nullable()
    .optional(),
  signature_goal: zod
    .number({ message: "Signature goal must be a number" })
    .int("Signature goal must be an integer")
    .positive("Signature goal must be a positive number")
    .nullable()
    .optional(),
  is_public: zod.boolean(),
  comments_active: zod.boolean(),
  comments_require_approval: zod.boolean(),
});

export type createCampaignInput = zod.infer<typeof createCampaignInput>;

export const campaignIdRowSchema = zod.object({
  id: zod.number().int(),
});

export type campaignIdRowSchema = zod.infer<typeof campaignIdRowSchema>;
