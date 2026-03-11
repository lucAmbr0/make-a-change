import { InternalServerError } from "../errors/ApiError";
import { inviteCodeRowSchema } from "../schemas/invite_codes";
import { DBError, query } from "./query";

export async function getInviteCodesForOrganization(data: {
  organization_id: number;
}) {
  try {
    const rows = await query<inviteCodeRowSchema>(
      `
      SELECT *
      FROM invite_codes
      WHERE organization_id = ?
      ORDER BY id ASC
      `,
      [data.organization_id],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getInviteCodesForOrganization:", error);
      throw new InternalServerError("Failed to retrieve invite codes.", {
        operation: "getInviteCodesForOrganization",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in getInviteCodesForOrganization:", error);
    throw new InternalServerError(
      "Failed to retrieve invite codes from database",
      {
        operation: "getInviteCodesForOrganization",
      },
    );
  }
}

export async function inviteCodeExists(data: { code: string }) {
  try {
    const rows = await query<{ id: number }>(
      `
      SELECT id
      FROM invite_codes
      WHERE code = ?
      `,
      [data.code],
    );

    return rows.length > 0;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in inviteCodeExists:", error);
      throw new InternalServerError("Failed to check invite code uniqueness.", {
        operation: "inviteCodeExists",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in inviteCodeExists:", error);
    throw new InternalServerError(
      "Failed to check invite code uniqueness from database",
      {
        operation: "inviteCodeExists",
      },
    );
  }
}

export async function getInviteCodeByCodeInOrganization(data: {
  code: string;
  organization_id: number;
}) {
  try {
    const rows = await query<inviteCodeRowSchema>(
      `
      SELECT *
      FROM invite_codes
      WHERE code = ? AND organization_id = ?
      `,
      [data.code, data.organization_id],
    );

    return rows[0] || null;
  } catch (error) {
    if (error instanceof DBError) {
      console.error(
        "Database error in getInviteCodeByCodeInOrganization:",
        error,
      );
      throw new InternalServerError("Failed to retrieve invite code.", {
        operation: "getInviteCodeByCodeInOrganization",
        dbCode: error.code,
      });
    }
    console.error(
      "Unexpected error in getInviteCodeByCodeInOrganization:",
      error,
    );
    throw new InternalServerError(
      "Failed to retrieve invite code from database",
      {
        operation: "getInviteCodeByCodeInOrganization",
      },
    );
  }
}

export async function getInviteCodeByCode(data: { code: string }) {
  try {
    const rows = await query<inviteCodeRowSchema>(
      `
      SELECT *
      FROM invite_codes
      WHERE code = ?
      `,
      [data.code],
    );

    return rows[0] || null;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getInviteCodeByCode:", error);
      throw new InternalServerError("Failed to retrieve invite code.", {
        operation: "getInviteCodeByCode",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in getInviteCodeByCode:", error);
    throw new InternalServerError("Failed to retrieve invite code from database", {
      operation: "getInviteCodeByCode",
    });
  }
}

export async function insertInviteCode(data: {
  organization_id: number;
  code: string;
  uses: number;
  expires_at: Date | null;
}) {
  try {
    const rows = await query<inviteCodeRowSchema>(
      `
      INSERT INTO invite_codes
        (
          organization_id,
          code,
          uses,
          expires_at
        )
      VALUES (?,?,?,?)
      RETURNING *
      `,
      [data.organization_id, data.code, data.uses, data.expires_at],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Invite code creation failed: no rows returned",
        {
          operation: "insertInviteCode",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in insertInviteCode:", error);
      throw new InternalServerError("Failed to create invite code.", {
        operation: "insertInviteCode",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in insertInviteCode:", error);
    throw new InternalServerError("Failed to insert invite code into database", {
      operation: "insertInviteCode",
    });
  }
}

export async function deleteInviteCodeByCodeInOrganization(data: {
  code: string;
  organization_id: number;
}) {
  try {
    await query(
      `
      DELETE FROM invite_codes
      WHERE code = ? AND organization_id = ?
      `,
      [data.code, data.organization_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error(
        "Database error in deleteInviteCodeByCodeInOrganization:",
        error,
      );
      throw new InternalServerError("Failed to delete invite code.", {
        operation: "deleteInviteCodeByCodeInOrganization",
        dbCode: error.code,
      });
    }
    console.error(
      "Unexpected error in deleteInviteCodeByCodeInOrganization:",
      error,
    );
    throw new InternalServerError(
      "Failed to delete invite code from database",
      {
        operation: "deleteInviteCodeByCodeInOrganization",
      },
    );
  }
}

export async function decrementInviteCodeUses(data: { id: number }) {
  try {
    await query(
      `
      UPDATE invite_codes
      SET uses = uses - 1
      WHERE id = ?
      `,
      [data.id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in decrementInviteCodeUses:", error);
      throw new InternalServerError("Failed to update invite code uses.", {
        operation: "decrementInviteCodeUses",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in decrementInviteCodeUses:", error);
    throw new InternalServerError("Failed to update invite code uses in database", {
      operation: "decrementInviteCodeUses",
    });
  }
}
