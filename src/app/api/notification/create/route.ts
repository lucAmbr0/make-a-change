import { createNotificationService } from "@/lib/services/notificationService";
import { route } from "@/lib/api/handler";

/**
 * POST /api/notification/create
 * Creates notifications for users (admin-only).
 */
export const POST = route(async (ctx) => {
  return await createNotificationService(ctx);
});
