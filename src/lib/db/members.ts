import { InternalServerError } from "../errors/ApiError";
import { memberRowSchema } from "../schemas/members";
import { query, DBError } from "./query";

export async function insertMember(data: {
    organization_id: number,
    user_id: number,
    is_moderator: boolean | null | undefined,
    is_owner: boolean | null | undefined,
}) {
  try {
    const rows = await query<memberRowSchema>(
      `
      INSERT INTO members
        (
          organization_id,
          user_id,
          is_moderator,
          is_owner
        )
      VALUES (?,?,?,?)
      RETURNING *
      `,
      [
        data.organization_id,
        data.user_id,
        data.is_moderator || null,
        data.is_owner || null,
      ],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError("Member creation failed: no rows returned", {
        operation: "insertMember",
      });
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in insertMember:", error);
      throw new InternalServerError(
        "Failed to create member. Please ensure all provided member data are valid.",
        {
          operation: "insertMember",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertMember:", error);
    throw new InternalServerError("Failed to insert member into database", {
      operation: "insertMember",
    });
  }
}