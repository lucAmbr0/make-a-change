import zod from "zod";

export const organizationRowSchema = zod.object({
  id: zod
    .number({ message: "ID must be a number" })
    .int("ID must be an integer"),
  creator_id: zod
    .number({ message: "Creator ID must be a number" })
    .int("Creator ID must be an integer"),
  name: zod
    .string({ message: "Name must be a string" })
    .max(64, "Name cannot exceed 64 characters"),
  description: zod
    .string({ message: "Description must be a string" })
    .max(65535, "Description is too long")
    .nullable()
    .optional(),
  created_at: zod.date({ message: "Created at must be a valid date" }),
  cover_path: zod
    .string({ message: "Cover path must be a string" })
    .max(64, "Cover path cannot exceed 64 characters")
    .nullable()
    .optional(),
  is_public: zod.boolean({ message: "Visibility flag must be true or false" }),
  requires_approval: zod.boolean({
    message: "Approval requirement flag must be true or false",
  }),
});

export type organizationRowSchema = zod.infer<typeof organizationRowSchema>;

export const organizationResponseSchema = zod.object({
  id: zod.number().int(),
  creator_id: zod.number().int(),
  creator_first_name: zod.string().max(32).nullable().optional(),
  creator_last_name: zod.string().max(32).nullable().optional(),
  name: zod.string().max(64),
  description: zod.string().max(65535).nullable().optional(),
  created_at: zod.date(),
  cover_path: zod.string().max(64).nullable().optional(),
  is_public: zod.boolean(),
  requires_approval: zod.boolean(),
});

export type organizationResponseSchema = zod.infer<
  typeof organizationResponseSchema
>;

export const createOrganizationInput = zod.object({
  name: zod
    .string({ message: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(64, "Name cannot exceed 64 characters")
    .trim(),
  description: zod
    .string({ message: "Description must be a string" })
    .max(65535, "Description is too long")
    .nullable()
    .optional(),
  cover_path: zod
    .string({ message: "Cover path must be a string" })
    .max(64, "Cover path cannot exceed 64 characters")
    .nullable()
    .optional(),
  is_public: zod.boolean({ message: "Visibility flag must be true or false" }),
  requires_approval: zod.boolean({
    message: "Approval requirement flag must be true or false",
  }),
});

export type createOrganizationInput = zod.infer<typeof createOrganizationInput>;

export const organizationNameSchema = zod.object({
  name: zod
    .string({ message: "Name must be a string" })
    .max(64, "Name cannot exceed 64 characters"),
});

export type organizationNameSchema = zod.infer<typeof organizationNameSchema>;
