import { NextRequest } from "next/server";
import { requireAuth } from "../auth/auth";
import { ValidationError, NotFoundError, UnauthorizedError } from "../errors/ApiError";
import {
    notificationActionInput,
    notificationResponseSchema,
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
import { isSuperUser } from "../auth/permissions";
import { ZodError } from "zod";
import { query } from "../db/query";

export async function getUserNotificationsService(req: NextRequest) {
    const auth = requireAuth(req);

    const notifications: notificationRowSchema[] = await getUserNotifications({
        user_id: auth.userId,
    });

    return notifications;
}

export async function handleNotificationActionService(
    req: NextRequest,
    actionType: "read" | "delete",
) {
    const auth = requireAuth(req);

    let body: any;
    try {
        body = await req.json();
    } catch (error) {
        throw new ValidationError("Invalid JSON in request body", {
            error: "Request body must be valid JSON",
        });
    }

    // Validate input against schema
    let input;
    try {
        input = notificationActionInput.parse(body);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError("Validation failed", {
                errors: error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code,
                })),
            });
        }
        throw error;
    }

    // Handle read_all action
    if (input.action === "read_all") {
        if (actionType !== "read") {
            throw new ValidationError("Invalid action for this endpoint", {
                error: "delete_all is only valid for DELETE requests",
            });
        }
        await readAllNotificationsForUser({ user_id: auth.userId });
        return { success: true, message: "All notifications marked as read" };
    }

    // Handle delete_all action
    if (input.action === "delete_all") {
        if (actionType !== "delete") {
            throw new ValidationError("Invalid action for this endpoint", {
                error: "delete_all is only valid for DELETE requests",
            });
        }
        await deleteAllNotificationsForUser({ user_id: auth.userId });
        return { success: true, message: "All notifications deleted" };
    }

    // Handle single notification actions
    const notificationId =
        input.action === "read_notification" || input.action === "delete_notification"
            ? input.notification_id
            : null;

    if (!notificationId) {
        throw new ValidationError("Notification ID is required", {
            error: "notification_id must be provided for this action",
        });
    }

    // Verify notification exists and corresponds to the user
    const notificationRows = await query<notificationRowSchema>(
        `SELECT * FROM notifications WHERE id = ?`,
        [notificationId],
    );

    if (!notificationRows || notificationRows.length === 0) {
        throw new NotFoundError("Notification not found");
    }

    const notification = notificationRows[0];

    // Verify user <-> notification
    if (notification.target_user_id !== auth.userId) {
        throw new UnauthorizedError("You don't have permission to modify this notification");
    }

    // Confirm
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

/**
 * Create notification for a single user
 * For internal use by other services
 */
export async function createNotificationForUser(data: {
    target_user_id: number;
    title: string;
    text: string;
}) {
    const notification = await insertNotificationOnUser({
        target_user_id: data.target_user_id,
        title: data.title,
        text: data.text,
        is_read: false,
    });

    return notification;
}

/**
 * Create notification for all users in an organization
 * For internal use by other services
 */
export async function createNotificationForOrganization(data: {
    organization_id: number;
    title: string;
    text: string;
}) {
    const notifications = await insertNotificationsForOrganization({
        organization_id: data.organization_id,
        title: data.title,
        text: data.text,
        is_read: false,
    });

    return notifications;
}

/**
 * Create notification for all users who signed a campaign
 * For internal use by other services
 */
export async function createNotificationForCampaignSigners(data: {
    campaign_id: number;
    title: string;
    text: string;
}) {
    const notifications = await insertNotificationsForCampaignSigners({
        campaign_id: data.campaign_id,
        title: data.title,
        text: data.text,
        is_read: false,
    });

    return notifications;
}

/**
 * Create notification for all active users
 * For internal use by other services
 */
export async function createNotificationForAllUsers(data: {
    title: string;
    text: string;
}) {
    const notifications = await insertNotificationsForAllUsers({
        title: data.title,
        text: data.text,
        is_read: false,
    });

    return notifications;
}

/**
 * Handle admin notification creation via API
 * Creates notifications based on type specified in request
 */
export async function createNotificationService(req: NextRequest) {
    const auth = requireAuth(req);

    // Verify user is admin
    const isAdmin = await isSuperUser(auth.userId);
    if (!isAdmin) {
        throw new UnauthorizedError("Only administrators can create notifications");
    }

    let body: any;
    try {
        body = await req.json();
    } catch (error) {
        throw new ValidationError("Invalid JSON in request body", {
            error: "Request body must be valid JSON",
        });
    }

    // Validate input against schema
    let input;
    try {
        input = createNotificationInput.parse(body);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError("Validation failed", {
                errors: error.issues.map((err: any) => ({
                    field: err.path.join("."),
                    message: err.message,
                    code: err.code,
                })),
            });
        }
        throw error;
    }

    // Handle based on type
    if (input.type === "user") {
        const notification = await createNotificationForUser({
            target_user_id: input.target_user_id,
            title: input.title,
            text: input.text,
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
