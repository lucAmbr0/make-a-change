import { InternalServerError } from "../errors/ApiError";
import { repostRowSchema } from "../schemas/reposts";
import { DBError, query } from "./query";

export async function insertRepost(data: {
  user_id: number;
  campaign_id: number;
}) {
  try {
    const rows = await query<repostRowSchema>(
      `
      INSERT INTO reposts
        (user_id, campaign_id)
      VALUES (?, ?)
      RETURNING *
      `,
      [data.user_id, data.campaign_id],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Repost creation failed: no rows returned",
        {
          operation: "insertRepost",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      if (error.code === "ER_DUP_ENTRY") {
        throw new InternalServerError(
          "This campaign is already reposted.",
          {
            operation: "insertRepost",
            dbCode: error.code,
          },
        );
      }

      console.error("Database error in insertRepost:", error);
      throw new InternalServerError(
        "Failed to repost campaign. Please ensure the campaign exists and you have access to it.",
        {
          operation: "insertRepost",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertRepost:", error);
    throw new InternalServerError("Failed to insert repost into database", {
      operation: "insertRepost",
    });
  }
}

export async function deleteRepost(data: {
  user_id: number;
  campaign_id: number;
}) {
  try {
    await query(
      `
      DELETE FROM reposts
      WHERE user_id = ? AND campaign_id = ?
      `,
      [data.user_id, data.campaign_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteRepost:", error);
      throw new InternalServerError("Failed to remove repost from database", {
        operation: "deleteRepost",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteRepost:", error);
    throw new InternalServerError("Failed to delete repost from database", {
      operation: "deleteRepost",
    });
  }
}

export async function getUserReposts(data: { user_id: number }) {
  try {
    const rows = await query<{
      id: number;
      title: string;
    }>(
      `
      SELECT c.id, c.title
      FROM reposts AS r
      JOIN campaigns AS c ON r.campaign_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.user_id, r.campaign_id
      `,
      [data.user_id],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getUserReposts:", error);
      throw new InternalServerError("Failed to retrieve user reposts.", {
        operation: "getUserReposts",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in getUserReposts:", error);
    throw new InternalServerError(
      "Failed to retrieve user reposts from database",
      {
        operation: "getUserReposts",
      },
    );
  }
}

export async function repostExists(data: {
  user_id: number;
  campaign_id: number;
}): Promise<boolean> {
  try {
    const rows = await query<repostRowSchema>(
      `
      SELECT *
      FROM reposts
      WHERE user_id = ? AND campaign_id = ?
      `,
      [data.user_id, data.campaign_id],
    );

    return rows && rows.length > 0;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in repostExists:", error);
      throw new InternalServerError("Failed to check if repost exists.", {
        operation: "repostExists",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in repostExists:", error);
    throw new InternalServerError("Failed to check if repost exists", {
      operation: "repostExists",
    });
  }
}
