import { InternalServerError } from "../errors/ApiError";
import { favoriteRowSchema } from "../schemas/favorites";
import { DBError, query } from "./query";

export async function insertFavorite(data: {
  user_id: number;
  campaign_id: number;
}) {
  try {
    const rows = await query<favoriteRowSchema>(
      `
      INSERT INTO favorites
        (user_id, campaign_id)
      VALUES (?, ?)
      RETURNING *
      `,
      [data.user_id, data.campaign_id],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Favorite creation failed: no rows returned",
        {
          operation: "insertFavorite",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      // Check for duplicate entry (favorite already exists)
      if (error.code === "ER_DUP_ENTRY") {
        throw new InternalServerError(
          "This campaign is already in your favorites.",
          {
            operation: "insertFavorite",
            dbCode: error.code,
          },
        );
      }

      console.error("Database error in insertFavorite:", error);
      throw new InternalServerError(
        "Failed to add campaign to favorites. Please ensure the campaign exists and you have access to it.",
        {
          operation: "insertFavorite",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertFavorite:", error);
    throw new InternalServerError("Failed to insert favorite into database", {
      operation: "insertFavorite",
    });
  }
}

export async function deleteFavorite(data: {
  user_id: number;
  campaign_id: number;
}) {
  try {
    await query(
      `
      DELETE FROM favorites
      WHERE user_id = ? AND campaign_id = ?
      `,
      [data.user_id, data.campaign_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteFavorite:", error);
      throw new InternalServerError("Failed to remove favorite from database", {
        operation: "deleteFavorite",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteFavorite:", error);
    throw new InternalServerError("Failed to delete favorite from database", {
      operation: "deleteFavorite",
    });
  }
}

export async function getUserFavorites(data: { user_id: number }) {
  try {
    const rows = await query<{
      id: number;
      title: string;
    }>(
      `
      SELECT c.id, c.title
      FROM favorites AS f
      JOIN campaigns AS c ON f.campaign_id = c.id
      WHERE f.user_id = ?
      ORDER BY f.user_id, f.campaign_id
      `,
      [data.user_id],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getUserFavorites:", error);
      throw new InternalServerError("Failed to retrieve user favorites.", {
        operation: "getUserFavorites",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in getUserFavorites:", error);
    throw new InternalServerError(
      "Failed to retrieve user favorites from database",
      {
        operation: "getUserFavorites",
      },
    );
  }
}

export async function favoriteExists(data: {
  user_id: number;
  campaign_id: number;
}): Promise<boolean> {
  try {
    const rows = await query<favoriteRowSchema>(
      `
      SELECT *
      FROM favorites
      WHERE user_id = ? AND campaign_id = ?
      `,
      [data.user_id, data.campaign_id],
    );

    return rows && rows.length > 0;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in favoriteExists:", error);
      throw new InternalServerError("Failed to check if favorite exists.", {
        operation: "favoriteExists",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in favoriteExists:", error);
    throw new InternalServerError("Failed to check if favorite exists", {
      operation: "favoriteExists",
    });
  }
}
