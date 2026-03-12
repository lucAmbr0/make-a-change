import zod from "zod";

export const memberRowSchema = zod.object({
  organization_id: zod.number().int(),
  user_id: zod.number().int(),
  is_moderator: zod.boolean().nullable().optional(),
  is_owner: zod.boolean().nullable().optional(),
});

export type memberRowSchema = zod.infer<typeof memberRowSchema>;

export const createMemberInput = zod.object({
  is_moderator: zod.boolean().nullable().optional(),
  is_owner: zod.boolean().nullable().optional(),
});

export type createMemberInput = zod.infer<typeof createMemberInput>;

export const deleteMemberInput = zod.object({
  user_id: zod
    .number({ message: "User ID is required" })
    .int("User ID must be an integer")
    .positive("User ID must be a positive number"),
});

export type deleteMemberInput = zod.infer<typeof deleteMemberInput>;

export const memberResponseSchema = zod.object({
  user_id: zod.number().int(),
  user_first_name: zod.string().max(32).nullable().optional(),
  user_last_name: zod.string().max(32).nullable().optional(),
  is_moderator: zod.boolean().nullable().optional(),
  is_owner: zod.boolean().nullable().optional(),
});

export type memberResponseSchema = zod.infer<typeof memberResponseSchema>;