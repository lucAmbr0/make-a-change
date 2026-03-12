import { InternalServerError, NotFoundError } from "../errors/ApiError";
import { memberResponseSchema, memberRowSchema } from "../schemas/members";
import { query, DBError } from "./query";

export async function insertMember(data: {
  organization_id: number;
  user_id: number;
  is_moderator: boolean | null | undefined;
  is_owner: boolean | null | undefined;
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
        data.is_moderator || 0,
        data.is_owner || 0,
      ],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Member creation failed: no rows returned",
        {
          operation: "insertMember",
        },
      );
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

export async function searchMemberOfOrganization(data: {
  user_id: number;
  organization_id: number;
}) {
  try {
    const rows = await query<memberRowSchema>(
      `
      SELECT * FROM members
      WHERE user_id = ? AND organization_id = ?
      `,
      [data.user_id, data.organization_id],
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in seachMemberOfOrganization:", error);
      throw new InternalServerError(
        "Failed to search member. Please ensure all provided member data are valid.",
        {
          operation: "seachMemberOfOrganization",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in seachMemberOfOrganization:", error);
    throw new InternalServerError("Failed to search member in database", {
      operation: "seachMemberOfOrganization",
    });
  }
}

export async function getMembersList(data: { organization_id: number }) {
  try {
    const rows = await query<memberResponseSchema>(
      `
      SELECT DISTINCT m.*, u.first_name as user_first_name, u.last_name as user_last_name
      FROM members AS m
        JOIN users AS u ON u.id = m.user_id
      WHERE
        m.organization_id = ?
      `,
      [data.organization_id],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError("Members list failed: no rows returned", {
        operation: "getMembersList",
      });
    }

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in getMembersList:", error);
      throw new InternalServerError(
        "Failed to get members. Please ensure all provided organization data are valid.",
        {
          operation: "getMembersList",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getMembersList:", error);
    throw new InternalServerError("Failed to retrieve members from database", {
      operation: "getMembersList",
    });
  }
}

export async function getMembersCount(data: { organization_id: number }) {
  try {
    const rows = await query<{ count: number }>(
      `
      SELECT DISTINCT COUNT(*) AS count
      FROM members AS m
      WHERE
        m.organization_id = ?
      `,
      [data.organization_id],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError("Members count failed: no rows returned", {
        operation: "getMembersCount",
      });
    }

    return rows[0].count;
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in getMembersCount:", error);
      throw new InternalServerError(
        "Failed to get members. Please ensure all provided organization data are valid.",
        {
          operation: "getMembersCount",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getMembersCount:", error);
    throw new InternalServerError(
      "Failed to retrieve members count from database",
      {
        operation: "getMembersCount",
      },
    );
  }
}

export async function deleteMember(data: {
  user_id: number;
  organization_id: number;
}) {
  try {
    await query(
      `
      DELETE FROM members
      WHERE user_id = ? AND organization_id = ?
      `,
      [data.user_id, data.organization_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteMember:", error);
      throw new InternalServerError("Failed to delete member.", {
        operation: "deleteMember",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteMember:", error);
    throw new InternalServerError("Failed to delete member from database", {
      operation: "deleteMember",
    });
  }
}
