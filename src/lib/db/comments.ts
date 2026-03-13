import { InternalServerError } from "../errors/ApiError";
import { commentResponseSchema, commentRowSchema } from "../schemas/comments";
import { DBError, query } from "./query";

export async function getCommentsForCampaign(data: {
  user_id: number | null;
  campaign_id: number;
}) {
  try {
    const rows = await query<commentResponseSchema>(
      `
      SELECT
        cm.*,
        u.first_name AS user_first_name,
        u.last_name AS user_last_name
      FROM comments AS cm
        JOIN campaigns AS c ON c.id = cm.campaign_id
        JOIN users AS u ON u.id = cm.user_id
        LEFT JOIN members AS m
          ON c.organization_id = m.organization_id
          AND m.user_id = ?
      WHERE
        cm.campaign_id = ?
        AND (
          cm.visible = 1
          OR (
            ? IS NOT NULL
            AND (
              cm.user_id = ?
              OR c.creator_id = ?
              OR m.is_moderator = 1
              OR m.is_owner = 1
            )
          )
        )
      ORDER BY cm.created_at ASC
      `,
      [
        data.user_id || null,
        data.campaign_id,
        data.user_id || null,
        data.user_id || null,
        data.user_id || null,
      ],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getCommentsForCampaign:", error);
      throw new InternalServerError(
        "Failed to get comments. Please ensure campaign data are valid.",
        {
          operation: "getCommentsForCampaign",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCommentsForCampaign:", error);
    throw new InternalServerError("Failed to retrieve comments from database", {
      operation: "getCommentsForCampaign",
    });
  }
}

export async function insertComment(data: {
  user_id: number;
  campaign_id: number;
  text: string;
  created_at: Date;
  visible: boolean;
}) {
  try {
    const rows = await query<commentRowSchema>(
      `
      INSERT INTO comments
        (
          user_id,
          campaign_id,
          text,
          created_at,
          visible
        )
      VALUES (?,?,?,?,?)
      RETURNING *
      `,
      [
        data.user_id,
        data.campaign_id,
        data.text,
        data.created_at,
        data.visible,
      ],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError("Comment creation failed: no rows returned", {
        operation: "insertComment",
      });
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in insertComment:", error);
      throw new InternalServerError(
        "Failed to create comment. Please ensure all provided data are valid.",
        {
          operation: "insertComment",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertComment:", error);
    throw new InternalServerError("Failed to insert comment into database", {
      operation: "insertComment",
    });
  }
}

export async function getCommentByIdInCampaign(data: {
  comment_id: number;
  campaign_id: number;
}) {
  try {
    const rows = await query<commentRowSchema>(
      `
      SELECT *
      FROM comments
      WHERE id = ? AND campaign_id = ?
      `,
      [data.comment_id, data.campaign_id],
    );

    return rows[0] || null;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getCommentByIdInCampaign:", error);
      throw new InternalServerError("Failed to get comment.", {
        operation: "getCommentByIdInCampaign",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in getCommentByIdInCampaign:", error);
    throw new InternalServerError("Failed to retrieve comment from database", {
      operation: "getCommentByIdInCampaign",
    });
  }
}

export async function checkDeleteCommentPrivileges(data: {
  user_id: number;
  campaign_id: number;
  comment_id: number;
}) {
  try {
    const rows = await query<{ id: number }>(
      `
      SELECT cm.id
      FROM comments AS cm
        JOIN campaigns AS c ON c.id = cm.campaign_id
        LEFT JOIN members AS m
          ON c.organization_id = m.organization_id
          AND m.user_id = ?
      WHERE
        cm.id = ?
        AND cm.campaign_id = ?
        AND (
          cm.user_id = ?
          OR c.creator_id = ?
          OR m.is_moderator = 1
          OR m.is_owner = 1
        )
      `,
      [
        data.user_id,
        data.comment_id,
        data.campaign_id,
        data.user_id,
        data.user_id,
      ],
    );

    return rows.length > 0;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in checkDeleteCommentPrivileges:", error);
      throw new InternalServerError("Failed to check delete privileges.", {
        operation: "checkDeleteCommentPrivileges",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in checkDeleteCommentPrivileges:", error);
    throw new InternalServerError(
      "Failed to check comment delete privileges from database",
      {
        operation: "checkDeleteCommentPrivileges",
      },
    );
  }
}

export async function deleteCommentByIdInCampaign(data: {
  comment_id: number;
  campaign_id: number;
}) {
  try {
    await query(
      `
      DELETE FROM comments
      WHERE id = ? AND campaign_id = ?
      `,
      [data.comment_id, data.campaign_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteCommentByIdInCampaign:", error);
      throw new InternalServerError("Failed to delete comment.", {
        operation: "deleteCommentByIdInCampaign",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteCommentByIdInCampaign:", error);
    throw new InternalServerError("Failed to delete comment from database", {
      operation: "deleteCommentByIdInCampaign",
    });
  }
}
