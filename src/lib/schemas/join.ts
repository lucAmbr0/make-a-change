import zod from "zod";

export const joinOrganizationInput = zod
  .object({
    organization_id: zod.number().int().positive().optional(),
    organizationId: zod.number().int().positive().optional(),
    invite_code: zod
      .string({ message: "Invite code must be a string" })
      .regex(/^[A-Z]{3}-\d{3}$/, "Invite code must be in the format AAA-123")
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (
      value.organization_id === undefined &&
      value.organizationId === undefined &&
      value.invite_code === undefined
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Either organization_id or invite_code is required",
        path: ["organization_id"],
      });
    }

    if (
      value.organization_id !== undefined &&
      value.organizationId !== undefined &&
      value.organization_id !== value.organizationId
    ) {
      ctx.addIssue({
        code: "custom",
        message: "organization_id and organizationId must match",
        path: ["organization_id"],
      });
    }
  });

export type joinOrganizationInput = zod.infer<typeof joinOrganizationInput>;