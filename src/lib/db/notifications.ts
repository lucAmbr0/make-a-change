import { InternalServerError } from "../errors/ApiError";
import { notificationRowSchema } from "../schemas/notifications";
import { DBError, query } from "./query";

export async function insertNotificationOnUser(data: {
  target_user_id: number;
  title: string;
  text: string;
  is_read?: boolean | null;
}) {
  try {
    const rows = await query<notificationRowSchema>(
      `
      INSERT INTO notifications
        (
          target_user_id,
          title,
          text,
          is_read
        )
      VALUES (?, ?, ?, ?)
      RETURNING *
      `,
      [data.target_user_id, data.title, data.text, data.is_read ? 1 : 0],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Notification creation failed: no rows returned",
        {
          operation: "insertNotificationOnUser",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in insertNotificationOnUser:", error);
      throw new InternalServerError("Failed to insert notification into database", {
        operation: "insertNotificationOnUser",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in insertNotificationOnUser:", error);
    throw new InternalServerError("Failed to insert notification into database", {
      operation: "insertNotificationOnUser",
    });
  }
}

export async function insertNotificationsForOrganization(data: {
  organization_id: number;
  title: string;
  text: string;
  is_read?: boolean | null;
}) {
  try {
    const rows = await query<notificationRowSchema>(
      `
      INSERT INTO notifications
        (
          target_user_id,
          title,
          text,
          is_read
        )
      SELECT m.user_id, ?, ?, ?
      FROM members m
      WHERE m.organization_id = ?
      RETURNING *
      `,
      [data.title, data.text, data.is_read ? 1 : 0, data.organization_id],
    );

    if (!rows) {
      throw new InternalServerError(
        "Notification creation failed: no rows returned",
        {
          operation: "insertNotificationsForOrganization",
        },
      );
    }

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in insertNotificationsForOrganization:", error);
      throw new InternalServerError(
        "Failed to insert notifications for organization",
        {
          operation: "insertNotificationsForOrganization",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertNotificationsForOrganization:", error);
    throw new InternalServerError(
      "Failed to insert notifications for organization",
      {
        operation: "insertNotificationsForOrganization",
      },
    );
  }
}

export async function deleteNotification(data: { id: number }) {
  try {
    await query(
      `
      DELETE FROM notifications
      WHERE id = ?
      `,
      [data.id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteNotification:", error);
      throw new InternalServerError("Failed to delete notification from database", {
        operation: "deleteNotification",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteNotification:", error);
    throw new InternalServerError("Failed to delete notification from database", {
      operation: "deleteNotification",
    });
  }
}

export async function readNotification(data: { id: number }) {
  try {
    const rows = await query<notificationRowSchema>(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
      RETURNING *
      `,
      [data.id],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Notification update failed: no rows returned",
        {
          operation: "readNotification",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in readNotification:", error);
      throw new InternalServerError("Failed to update notification in database", {
        operation: "readNotification",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in readNotification:", error);
    throw new InternalServerError("Failed to update notification in database", {
      operation: "readNotification",
    });
  }
}

export async function getUserNotifications(data: { user_id: number }) {
  try {
    const rows = await query<notificationRowSchema>(
      `
      SELECT *
      FROM notifications
      WHERE target_user_id = ?
      ORDER BY id DESC
      `,
      [data.user_id],
    );

    return rows || [];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getUserNotifications:", error);
      throw new InternalServerError("Failed to retrieve notifications from database", {
        operation: "getUserNotifications",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in getUserNotifications:", error);
    throw new InternalServerError("Failed to retrieve notifications from database", {
      operation: "getUserNotifications",
    });
  }
}

export async function readAllNotificationsForUser(data: { user_id: number }) {
  try {
    const rows = await query<notificationRowSchema>(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE target_user_id = ?
      RETURNING *
      `,
      [data.user_id],
    );

    return rows || [];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in readAllNotificationsForUser:", error);
      throw new InternalServerError("Failed to update notifications in database", {
        operation: "readAllNotificationsForUser",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in readAllNotificationsForUser:", error);
    throw new InternalServerError("Failed to update notifications in database", {
      operation: "readAllNotificationsForUser",
    });
  }
}

export async function deleteAllNotificationsForUser(data: { user_id: number }) {
  try {
    await query(
      `
      DELETE FROM notifications
      WHERE target_user_id = ?
      `,
      [data.user_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteAllNotificationsForUser:", error);
      throw new InternalServerError("Failed to delete notifications from database", {
        operation: "deleteAllNotificationsForUser",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteAllNotificationsForUser:", error);
    throw new InternalServerError("Failed to delete notifications from database", {
      operation: "deleteAllNotificationsForUser",
    });
  }
}

export async function insertNotificationsForCampaignSigners(data: {
  campaign_id: number;
  title: string;
  text: string;
  is_read?: boolean | null;
}) {
  try {
    const rows = await query<notificationRowSchema>(
      `
      INSERT INTO notifications
        (
          target_user_id,
          title,
          text,
          is_read
        )
      SELECT DISTINCT s.signer_id, ?, ?, ?
      FROM signatures s
      WHERE s.campaign_id = ?
      RETURNING *
      `,
      [data.title, data.text, data.is_read ? 1 : 0, data.campaign_id],
    );

    if (!rows) {
      throw new InternalServerError(
        "Notification creation failed: no rows returned",
        {
          operation: "insertNotificationsForCampaignSigners",
        },
      );
    }

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in insertNotificationsForCampaignSigners:", error);
      throw new InternalServerError(
        "Failed to insert notifications for campaign signers",
        {
          operation: "insertNotificationsForCampaignSigners",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertNotificationsForCampaignSigners:", error);
    throw new InternalServerError(
      "Failed to insert notifications for campaign signers",
      {
        operation: "insertNotificationsForCampaignSigners",
      },
    );
  }
}

export async function insertNotificationsForAllUsers(data: {
  title: string;
  text: string;
  is_read?: boolean | null;
}) {
  try {
    const rows = await query<notificationRowSchema>(
      `
      INSERT INTO notifications
        (
          target_user_id,
          title,
          text,
          is_read
        )
      SELECT u.id, ?, ?, ?
      FROM users u
      WHERE u.is_active = 1
      RETURNING *
      `,
      [data.title, data.text, data.is_read ? 1 : 0],
    );

    if (!rows) {
      throw new InternalServerError(
        "Notification creation failed: no rows returned",
        {
          operation: "insertNotificationsForAllUsers",
        },
      );
    }

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in insertNotificationsForAllUsers:", error);
      throw new InternalServerError(
        "Failed to insert notifications for all users",
        {
          operation: "insertNotificationsForAllUsers",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertNotificationsForAllUsers:", error);
    throw new InternalServerError(
      "Failed to insert notifications for all users",
      {
        operation: "insertNotificationsForAllUsers",
      },
    );
  }
}
