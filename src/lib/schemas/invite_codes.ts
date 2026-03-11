import zod from "zod";

export const inviteCodeRowSchema = zod.object({
  id: zod.number().int(),
  organization_id: zod.number().int(),
  code: zod.string().max(8),
  uses: zod.number().int().nonnegative(),
  expires_at: zod.date().nullable().optional(),
});

export type inviteCodeRowSchema = zod.infer<typeof inviteCodeRowSchema>;

export const createInviteCodeInput = zod.object({
  uses: zod
    .number({ message: "Uses is required" })
    .int("Uses must be an integer")
    .positive("Uses must be a positive number"),
  expires_at: zod
    .date("Expire date must be a valid date")
    .nullable()
    .optional(),
});

export type createInviteCodeInput = zod.infer<typeof createInviteCodeInput>;

export const deleteInviteCodeInput = zod.object({
  code: zod
    .string({ message: "Code is required" })
    .length(7, "Code must be in the format AAA-123"),
});

export type deleteInviteCodeInput = zod.infer<typeof deleteInviteCodeInput>;

export const joinWithInviteCodeInput = zod.object({
  invite_code: zod
    .string({ message: "Invite code is required" })
    .regex(/^[A-Z]{3}-\d{3}$/, "Invite code must be in the format AAA-123"),
});

export type joinWithInviteCodeInput = zod.infer<typeof joinWithInviteCodeInput>;
