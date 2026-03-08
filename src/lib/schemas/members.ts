import zod from "zod";

export const memberRowSchema = zod.object({
  organization_id: zod.number().int(),
  user_id: zod.number().int(),
  is_moderator: zod.boolean().nullable().optional(),
  is_owner: zod.boolean().nullable().optional(),
});

export type memberRowSchema = zod.infer<typeof memberRowSchema>;

export const createMemberInput = zod.object({
  organization_id: zod.number().int(),
  is_moderator: zod.boolean().nullable().optional(),
  is_owner: zod.boolean().nullable().optional(),
});

export type createMemberInput = zod.infer<typeof createMemberInput>;
