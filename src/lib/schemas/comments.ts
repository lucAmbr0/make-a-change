import zod from "zod";

export const commentRowSchema = zod.object({
  id: zod.number().int(),
  user_id: zod.number().int(),
  campaign_id: zod.number().int(),
  text: zod.string(),
  created_at: zod.date(),
  visible: zod.boolean(),
});

export type commentRowSchema = zod.infer<typeof commentRowSchema>;

export const commentResponseSchema = zod.object({
  id: zod.number().int(),
  user_id: zod.number().int(),
  campaign_id: zod.number().int(),
  user_first_name: zod.string().max(32).nullable().optional(),
  user_last_name: zod.string().max(32).nullable().optional(),
  text: zod.string(),
  created_at: zod.date(),
  visible: zod.boolean(),
});

export type commentResponseSchema = zod.infer<typeof commentResponseSchema>;

export const createCommentInput = zod.object({
  text: zod
    .string({ message: "Text is required" })
    .min(1, "Text cannot be empty")
    .max(65535, "Text is too long")
    .trim(),
});

export type createCommentInput = zod.infer<typeof createCommentInput>;

export const deleteCommentInput = zod.object({
  comment_id: zod
    .number({ message: "Comment ID is required" })
    .int("Comment ID must be an integer")
    .positive("Comment ID must be a positive number"),
});

export type deleteCommentInput = zod.infer<typeof deleteCommentInput>;
