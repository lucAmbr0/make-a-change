import zod from "zod";

export const notificationRowSchema = zod.object({
  id: zod.number().int(),
  target_user_id: zod.number().int(),
  title: zod.string().max(32),
  text: zod.string(),
  is_read: zod.boolean(),
});

export type notificationRowSchema = zod.infer<typeof notificationRowSchema>;

export const notificationResponseSchema = zod.object({
  id: zod.number().int(),
  target_user_id: zod.number().int(),
  title: zod.string().max(32),
  text: zod.string(),
  is_read: zod.boolean(),
});

export type notificationResponseSchema = zod.infer<typeof notificationResponseSchema>;

export const markNotificationAsReadInput = zod.object({
  notification_id: zod
    .number({ message: "Notification ID is required" })
    .int("Notification ID must be an integer")
    .positive("Notification ID must be a positive number"),
});

export type markNotificationAsReadInput = zod.infer<typeof markNotificationAsReadInput>;

export const notificationActionInput = zod.union([
  zod.object({
    action: zod.literal("read_notification"),
    notification_id: zod
      .number({ message: "Notification ID is required" })
      .int("Notification ID must be an integer")
      .positive("Notification ID must be a positive number"),
  }),
  zod.object({
    action: zod.literal("read_all"),
  }),
  zod.object({
    action: zod.literal("delete_notification"),
    notification_id: zod
      .number({ message: "Notification ID is required" })
      .int("Notification ID must be an integer")
      .positive("Notification ID must be a positive number"),
  }),
  zod.object({
    action: zod.literal("delete_all"),
  }),
]);

export type notificationActionInput = zod.infer<typeof notificationActionInput>;

export const createNotificationInput = zod.union([
  zod.object({
    type: zod.literal("user"),
    target_user_id: zod
      .number({ message: "Target user ID is required" })
      .int("Target user ID must be an integer")
      .positive("Target user ID must be a positive number"),
    title: zod
      .string({ message: "Title is required" })
      .min(1, "Title cannot be empty")
      .max(32, "Title cannot exceed 32 characters")
      .trim(),
    text: zod
      .string({ message: "Text is required" })
      .min(1, "Text cannot be empty")
      .max(65535, "Text is too long")
      .trim(),
  }),
  zod.object({
    type: zod.literal("organization"),
    organization_id: zod
      .number({ message: "Organization ID is required" })
      .int("Organization ID must be an integer")
      .positive("Organization ID must be a positive number"),
    title: zod
      .string({ message: "Title is required" })
      .min(1, "Title cannot be empty")
      .max(32, "Title cannot exceed 32 characters")
      .trim(),
    text: zod
      .string({ message: "Text is required" })
      .min(1, "Text cannot be empty")
      .max(65535, "Text is too long")
      .trim(),
  }),
  zod.object({
    type: zod.literal("campaign_signers"),
    campaign_id: zod
      .number({ message: "Campaign ID is required" })
      .int("Campaign ID must be an integer")
      .positive("Campaign ID must be a positive number"),
    title: zod
      .string({ message: "Title is required" })
      .min(1, "Title cannot be empty")
      .max(32, "Title cannot exceed 32 characters")
      .trim(),
    text: zod
      .string({ message: "Text is required" })
      .min(1, "Text cannot be empty")
      .max(65535, "Text is too long")
      .trim(),
  }),
  zod.object({
    type: zod.literal("all_users"),
    title: zod
      .string({ message: "Title is required" })
      .min(1, "Title cannot be empty")
      .max(32, "Title cannot exceed 32 characters")
      .trim(),
    text: zod
      .string({ message: "Text is required" })
      .min(1, "Text cannot be empty")
      .max(65535, "Text is too long")
      .trim(),
  }),
]);

export type createNotificationInput = zod.infer<typeof createNotificationInput>;
