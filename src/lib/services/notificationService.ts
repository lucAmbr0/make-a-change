import { requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/ApiError";
import {
  notificationActionInput,
  notificationRowSchema,
  createNotificationInput,
} from "../schemas/notifications";
import {
  getUserNotifications,
  readNotification,
  readAllNotificationsForUser,
  deleteNotification,
  deleteAllNotificationsForUser,
  insertNotificationOnUser,
  insertNotificationsForOrganization,
  insertNotificationsForCampaignSigners,
  insertNotificationsForAllUsers,
} from "../db/notifications";
import { requireSuperUser } from "../auth/permissions";
import { query } from "../db/query";
import { parseBody } from "../api/body";

export async function getUserNotificationsService(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  return await getUserNotifications({ user_id: auth.userId });
}

export async function handleNotificationActionService(
  ctx: RequestCtx,
  actionType: "read" | "delete",
) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, notificationActionInput);

  if (input.action === "read_all") {
    if (actionType !== "read") {
      throw new ValidationError("Invalid action for this endpoint", {
        error: "delete_all is only valid for DELETE requests",
      });
    }
    await readAllNotificationsForUser({ user_id: auth.userId });
    return { success: true, message: "All notifications marked as read" };
  }

  if (input.action === "delete_all") {
    if (actionType !== "delete") {
      throw new ValidationError("Invalid action for this endpoint", {
        error: "delete_all is only valid for DELETE requests",
      });
    }
    await deleteAllNotificationsForUser({ user_id: auth.userId });
    return { success: true, message: "All notifications deleted" };
  }

  const notificationId =
    input.action === "read_notification" || input.action === "delete_notification"
      ? input.notification_id
      : null;

  if (!notificationId) {
    throw new ValidationError("Notification ID is required", {
      error: "notification_id must be provided for this action",
    });
  }

  const notificationRows = await query<notificationRowSchema>(
    `SELECT * FROM notifications WHERE id = ?`,
    [notificationId],
  );

  if (!notificationRows || notificationRows.length === 0) {
    throw new NotFoundError("Notification not found");
  }

  const notification = notificationRows[0];

  if (notification.target_user_id !== auth.userId) {
    throw new UnauthorizedError(
      "You don't have permission to modify this notification",
    );
  }

  if (input.action === "read_notification") {
    if (actionType !== "read") {
      throw new ValidationError("Invalid action for this endpoint", {
        error: "read_notification is only valid for POST requests",
      });
    }
    await readNotification({ id: notificationId });
    return { success: true, message: "Notification marked as read" };
  }

  if (input.action === "delete_notification") {
    if (actionType !== "delete") {
      throw new ValidationError("Invalid action for this endpoint", {
        error: "delete_notification is only valid for DELETE requests",
      });
    }
    await deleteNotification({ id: notificationId });
    return { success: true, message: "Notification deleted" };
  }

  throw new ValidationError("Unknown action", {
    error: "The provided action is not recognized",
  });
}

export async function createNotificationForUser(data: {
  target_user_id: number;
  title: string;
  text: string;
  href?: string | null;
}) {
  return await insertNotificationOnUser({
    target_user_id: data.target_user_id,
    title: data.title,
    text: data.text,
    is_read: false,
    href: data.href,
  });
}

export async function createNotificationForOrganization(data: {
  organization_id: number;
  title: string;
  text: string;
  href?: string | null;
}) {
  return await insertNotificationsForOrganization({
    organization_id: data.organization_id,
    title: data.title,
    text: data.text,
    is_read: false,
    href: data.href,
  });
}

export async function createNotificationForCampaignSigners(data: {
  campaign_id: number;
  title: string;
  text: string;
  href?: string | null;
}) {
  return await insertNotificationsForCampaignSigners({
    campaign_id: data.campaign_id,
    title: data.title,
    text: data.text,
    is_read: false,
    href: data.href,
  });
}

export async function createNotificationForAllUsers(data: {
  title: string;
  text: string;
  href?: string | null;
}) {
  return await insertNotificationsForAllUsers({
    title: data.title,
    text: data.text,
    is_read: false,
    href: data.href,
  });
}

export async function createNotificationService(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  await requireSuperUser(auth.userId, ctx);

  const input = await parseBody(ctx, createNotificationInput);

  if (input.type === "user") {
    const notification = await createNotificationForUser({
      target_user_id: input.target_user_id,
      title: input.title,
      text: input.text,
      href: input.href,
    });
    return {
      success: true,
      message: "Notification created for user",
      notification,
    };
  }

  if (input.type === "organization") {
    const notifications = await createNotificationForOrganization({
      organization_id: input.organization_id,
      title: input.title,
      text: input.text,
      href: input.href,
    });
    return {
      success: true,
      message: `Notification created for ${notifications.length} organization members`,
      count: notifications.length,
    };
  }

  if (input.type === "campaign_signers") {
    const notifications = await createNotificationForCampaignSigners({
      campaign_id: input.campaign_id,
      title: input.title,
      text: input.text,
      href: input.href,
    });
    return {
      success: true,
      message: `Notification created for ${notifications.length} campaign signers`,
      count: notifications.length,
    };
  }

  if (input.type === "all_users") {
    const notifications = await createNotificationForAllUsers({
      title: input.title,
      text: input.text,
      href: input.href,
    });
    return {
      success: true,
      message: `Notification created for ${notifications.length} users`,
      count: notifications.length,
    };
  }

  throw new ValidationError("Unknown notification type", {
    error: "The provided type is not recognized",
  });
}
