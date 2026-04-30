import {
  getUserNotificationsService,
  handleNotificationActionService,
} from "@/lib/services/notificationService";
import { route } from "@/lib/api/handler";

export const GET = route(async (ctx) => {
  return await getUserNotificationsService(ctx);
});

export const POST = route(async (ctx) => {
  return await handleNotificationActionService(ctx, "read");
});

export const DELETE = route(async (ctx) => {
  return await handleNotificationActionService(ctx, "delete");
});
