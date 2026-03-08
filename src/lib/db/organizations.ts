import { query, DBError } from "../db/query";
import { InternalServerError } from "../errors/ApiError";
import {
  organizationNameSchema,
  organizationRowSchema,
} from "../schemas/organization";

export async function insertOrganization(data: {
  creator_id: number;
  name: string;
  description: string | null | undefined;
  created_at: Date;
  cover_path: string | null | undefined;
  is_public: boolean;
  requires_approval: boolean;
}) {
  try {
    const rows = await query<organizationRowSchema>(
      `
      INSERT INTO organizations
        (
          creator_id,
          name,
          description,
          created_at,
          cover_path,
          is_public,
          requires_approval
        )
      VALUES (?,?,?,?,?,?,?)
      RETURNING *
      `,
      [
        data.creator_id,
        data.name || null,
        data.description || null,
        data.created_at,
        data.cover_path || null,
        data.is_public,
        data.requires_approval,
      ],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Organization creation failed: no rows returned",
        {
          operation: "insertOrganization",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in insertOrganization:", error);
      throw new InternalServerError(
        "Failed to create Organization. Please ensure all provided organization data is valid.",
        {
          operation: "insertOrganization",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertOrganization:", error);
    throw new InternalServerError(
      "Failed to insert organization into database",
      {
        operation: "insertOrganization",
      },
    );
  }
}

export async function getOrganizationsNames() {
  try {
    const rows = await query<organizationNameSchema>(
      `
        SELECT name FROM organizations;
      `,
    );

    // if (!rows || rows.length === 0) {
    //   throw new InternalServerError(
    //     "getOrganizationsNames failed: no rows returned",
    //     {
    //       operation: "getOrganizationsNames",
    //     },
    //   );
    // }

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in getOrganizationsNames:", error);
      throw new InternalServerError(
        "Failed to get Organizations names. Please ensure all data is valid.",
        {
          operation: "getOrganizationsNames",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getOrganizationsNames:", error);
    throw new InternalServerError(
      "Failed to get organizations names from database",
      {
        operation: "getOrganizationsNames",
      },
    );
  }
}
