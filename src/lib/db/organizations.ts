import { query, DBError } from "../db/query";
import { InternalServerError } from "../errors/ApiError";
import {
  organizationNameSchema,
  organizationResponseSchema,
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

export async function getOrganization(data: {
  user_id: number | null;
  organization_id: number;
}) {
  {
    try {
      const rows = await query<organizationResponseSchema>(
        `
        SELECT DISTINCT
          o.*,
          u.first_name as creator_first_name,
          u.last_name as creator_last_name
        FROM organizations AS o
          LEFT JOIN users AS u ON o.creator_id = u.id
          LEFT JOIN members AS m 
          ON o.id = m.organization_id 
          AND m.user_id = ?
        WHERE 
          o.id = ? AND
          (o.is_public = 1
          OR o.creator_id = ?
          OR m.user_id IS NOT NULL)
        `,
        [data.user_id || null, data.organization_id, data.user_id || null],
      );

      return rows[0];
    } catch (error) {
      if (error instanceof DBError) {
        // Translate DB errors to meaningful API errors
        console.error("Database error in getOrganization:", error);
        throw new InternalServerError(
          "Failed to get organization. Please ensure all provided organization data are valid.",
          {
            operation: "getOrganization",
            dbCode: error.code,
          },
        );
      }
      console.error("Unexpected error in getOrganization:", error);
      throw new InternalServerError(
        "Failed to retrieve organization from database",
        {
          operation: "getOrganization",
        },
      );
    }
  }
}

export async function getOrganizationById(data: { organization_id: number }) {
  try {
    const rows = await query<organizationRowSchema>(
      `
      SELECT *
      FROM organizations
      WHERE id = ?
      `,
      [data.organization_id],
    );

    return rows[0] || null;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getOrganizationById:", error);
      throw new InternalServerError(
        "Failed to get organization. Please ensure all provided organization data are valid.",
        {
          operation: "getOrganizationById",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getOrganizationById:", error);
    throw new InternalServerError(
      "Failed to retrieve organization from database",
      {
        operation: "getOrganizationById",
      },
    );
  }
}

export async function deleteOrganization(data: { organization_id: number }) {
  try {
    // Delete dependent records in cascade order
    // Delete favorites first
    await query(
      `
      DELETE FROM favorites
      WHERE campaign_id IN (
        SELECT id FROM campaigns
        WHERE organization_id = ?
      )
      `,
      [data.organization_id],
    );

    // Delete signatures
    await query(
      `
      DELETE FROM signatures
      WHERE campaign_id IN (
        SELECT id FROM campaigns
        WHERE organization_id = ?
      )
      `,
      [data.organization_id],
    );

    // Delete comments
    await query(
      `
      DELETE FROM comments
      WHERE campaign_id IN (
        SELECT id FROM campaigns
        WHERE organization_id = ?
      )
      `,
      [data.organization_id],
    );

    // Delete campaigns
    await query(
      `
      DELETE FROM campaigns
      WHERE organization_id = ?
      `,
      [data.organization_id],
    );

    // Delete approval requests
    await query(
      `
      DELETE FROM approval_requests
      WHERE organization_id = ?
      `,
      [data.organization_id],
    );

    // Delete invite codes
    await query(
      `
      DELETE FROM invite_codes
      WHERE organization_id = ?
      `,
      [data.organization_id],
    );

    // Delete members
    await query(
      `
      DELETE FROM members
      WHERE organization_id = ?
      `,
      [data.organization_id],
    );

    // Delete organization
    await query(
      `
      DELETE FROM organizations
      WHERE id = ?
      `,
      [data.organization_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteOrganization:", error);
      throw new InternalServerError("Failed to delete organization.", {
        operation: "deleteOrganization",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteOrganization:", error);
    throw new InternalServerError(
      "Failed to delete organization from database",
      {
        operation: "deleteOrganization",
      },
    );
  }
}

export async function getOrganizationsForUser(data: {
  user_id: number | null;
}) {
  try {
    const rows = await query<organizationRowSchema>(
      `
      SELECT DISTINCT o.*
      FROM organizations AS o
      LEFT JOIN members AS m 
        ON o.id = m.organization_id 
        AND m.user_id = ?
      WHERE o.is_public = 1
        OR m.user_id IS NOT NULL
      `,
      [data.user_id || null],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in getOrganizationsForUser:", error);
      throw new InternalServerError(
        "Failed to get organizations. Please ensure all provided data is valid.",
        {
          operation: "getOrganizationsForUser",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getOrganizationsForUser:", error);
    throw new InternalServerError(
      "Failed to retrieve organizations from database",
      {
        operation: "getOrganizationsForUser",
      },
    );
  }
}