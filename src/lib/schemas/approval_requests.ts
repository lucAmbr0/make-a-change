import zod from "zod";

export const approvalRequestRowSchema = zod.object({
  user_id: zod.number().int(),
  organization_id: zod.number().int(),
  requested_at: zod.date(),
});

export type approvalRequestRowSchema = zod.infer<
  typeof approvalRequestRowSchema
>;

export const approvalRequestResponseSchema = approvalRequestRowSchema.extend({
  user_first_name: zod.string().max(32).nullable().optional(),
  user_last_name: zod.string().max(32).nullable().optional(),
});

export type approvalRequestResponseSchema = zod.infer<
  typeof approvalRequestResponseSchema
>;

export const approvalRequestDecisionInput = zod
  .object({
    user_id: zod.number().int().positive().optional(),
    userId: zod.number().int().positive().optional(),
    userI_id: zod.number().int().positive().optional(),
    approval: zod.boolean({ message: "Approval flag must be true or false" }),
  })
  .superRefine((value, ctx) => {
    const userIds = [value.user_id, value.userId, value.userI_id].filter(
      (userId): userId is number => userId !== undefined,
    );

    if (userIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "User ID is required",
        path: ["user_id"],
      });
      return;
    }

    if (new Set(userIds).size > 1) {
      ctx.addIssue({
        code: "custom",
        message: "Provided user ID fields must match",
        path: ["user_id"],
      });
    }
  });

export type approvalRequestDecisionInput = zod.infer<
  typeof approvalRequestDecisionInput
>;