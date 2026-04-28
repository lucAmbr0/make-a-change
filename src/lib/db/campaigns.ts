import { InternalServerError, NotFoundError } from "../errors/ApiError";
import {
  campaignResponseSchema,
  campaignRowSchema,
} from "../schemas/campaigns";
import { deleteResultRow } from "../schemas/db";
import { DBError, query } from "./query";

export async function insertCampaign(data: {
  organization_id: number | null | undefined;
  creator_id: number;
  title: string;
  description: string | null | undefined;
  created_at: Date;
  cover_path: string | null | undefined;
  signature_goal: number | null | undefined;
  is_public: boolean;
  comments_active: boolean;
  comments_require_approval: boolean;
}) {
  try {
    const rows = await query<campaignRowSchema>(
      `
      INSERT INTO campaigns
        (
          organization_id,
          creator_id,
          title,
          description,
          created_at,
          cover_path,
          signature_goal,
          is_public,
          comments_active,
          comments_require_approval
        )
      VALUES (?,?,?,?,?,?,?,?,?,?)
      RETURNING *
      `,
      [
        data.organization_id || null,
        data.creator_id,
        data.title,
        data.description || null,
        data.created_at,
        data.cover_path || null,
        data.signature_goal || null,
        data.is_public,
        data.comments_active,
        data.comments_require_approval,
      ],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Campaign creation failed: no rows returned",
        {
          operation: "insertCampaign",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in insertCampaign:", error);
      throw new InternalServerError(
        "Failed to create campaign. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "insertCampaign",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in insertCampaign:", error);
    throw new InternalServerError("Failed to insert campaign into database", {
      operation: "insertCampaign",
    });
  }
}

export async function getCampaignsForUser(data: { user_id: number | null }) {
  try {
    const rows = await query<campaignRowSchema>(
      `
      SELECT DISTINCT c.*
      FROM campaigns AS c
      LEFT JOIN members AS m 
        ON c.organization_id = m.organization_id 
        AND m.user_id = ?
      WHERE c.is_public = 1
        OR c.creator_id = ?
        OR m.user_id IS NOT NULL
      `,
      [data.user_id || null, data.user_id || null],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in getCampaignsForUser:", error);
      throw new InternalServerError(
        "Failed to get campaigns. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "getCampaignsForUser",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCampaignsForUser:", error);
    throw new InternalServerError(
      "Failed to retrieve campaigns from database",
      {
        operation: "getCampaignsForUser",
      },
    );
  }
}

export async function getCampaignsForUserWithDetails(data: { user_id: number | null }) {
  try {
    const rows = await query<campaignResponseSchema>(
      `
      SELECT DISTINCT
        c.*,
        COALESCE(sc.signatures, 0) AS signatures,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        o.name as organization_name
      FROM campaigns AS c
        LEFT JOIN users AS u ON c.creator_id = u.id
        LEFT JOIN organizations AS o ON c.organization_id = o.id
        LEFT JOIN (
          SELECT campaign_id, COUNT(id) AS signatures
          FROM signatures
          GROUP BY campaign_id
        ) AS sc ON sc.campaign_id = c.id
        LEFT JOIN members AS m 
        ON c.organization_id = m.organization_id 
        AND m.user_id = ?
      WHERE c.is_public = 1
        OR c.creator_id = ?
        OR m.user_id IS NOT NULL
      `,
      [data.user_id || null, data.user_id || null],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getCampaignsForUserWithDetails:", error);
      throw new InternalServerError(
        "Failed to get campaigns. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "getCampaignsForUserWithDetails",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCampaignsForUserWithDetails:", error);
    throw new InternalServerError(
      "Failed to retrieve campaigns from database",
      {
        operation: "getCampaignsForUserWithDetails",
      },
    );
  }
}

export async function getCampaign(data: {
  user_id: number | null;
  campaign_id: number;
}) {
  try {
    const rows = await query<campaignResponseSchema>(
      `
      SELECT DISTINCT
        c.*,
        COALESCE(sc.signatures, 0) AS signatures,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        o.name as organization_name
      FROM campaigns AS c
        LEFT JOIN users AS u ON c.creator_id = u.id
        LEFT JOIN organizations AS o ON c.organization_id = o.id
        LEFT JOIN (
          SELECT campaign_id, COUNT(id) AS signatures
          FROM signatures
          GROUP BY campaign_id
        ) AS sc ON sc.campaign_id = c.id
        LEFT JOIN members AS m 
        ON c.organization_id = m.organization_id 
        AND m.user_id = ?
      WHERE 
        c.id = ? AND
        (c.is_public = 1
        OR c.creator_id = ?
        OR m.user_id IS NOT NULL)
      `,
      [data.user_id || null, data.campaign_id, data.user_id || null],
    );

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in getCampaign:", error);
      throw new InternalServerError(
        "Failed to get campaigns. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "getCampaign",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCampaign:", error);
    throw new InternalServerError("Failed to retrieve campaign from database", {
      operation: "getCampaign",
    });
  }
}

/**
 * Get campaign by ID without authorization checks
 * Used for superusers who have already been authorized
 */
export async function getCampaignUnauthorized(data: {
  campaign_id: number;
}) {
  try {
    const rows = await query<campaignResponseSchema>(
      `
      SELECT DISTINCT
        c.*,
        COALESCE(sc.signatures, 0) AS signatures,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        o.name as organization_name
      FROM campaigns AS c
        LEFT JOIN users AS u ON c.creator_id = u.id
        LEFT JOIN organizations AS o ON c.organization_id = o.id
        LEFT JOIN (
          SELECT campaign_id, COUNT(id) AS signatures
          FROM signatures
          GROUP BY campaign_id
        ) AS sc ON sc.campaign_id = c.id
      WHERE c.id = ?
      `,
      [data.campaign_id],
    );

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getCampaignUnauthorized:", error);
      throw new InternalServerError(
        "Failed to get campaign. Please ensure the campaign exists.",
        {
          operation: "getCampaignUnauthorized",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCampaignUnauthorized:", error);
    throw new InternalServerError("Failed to retrieve campaign from database", {
      operation: "getCampaignUnauthorized",
    });
  }
}

export async function checkDeleteCampaignPrivileges(data: {
  user_id: number;
  campaign_id: number;
}) {
  try {
    const rows = await query<campaignRowSchema>(
      `
        SELECT c.* FROM campaigns as c
        LEFT JOIN members as m
          ON c.organization_id = m.organization_id
          AND m.user_id = ?
        WHERE
        c.id = ?
        AND
        (
          c.creator_id = ?
          OR m.is_moderator = 1
          OR m.is_owner = 1
        )
      `,
      [data.user_id, data.campaign_id, data.user_id],
    );

    if (rows.length > 0) return true;
    else return false;
  } catch (error) {
    if (error instanceof DBError) {
      // Translate DB errors to meaningful API errors
      console.error("Database error in checkDeleteCampaignPrivileges:", error);
      throw new InternalServerError(
        "Failed to check campaign delete privileges. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "checkDeleteCampaignPrivileges",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in checkDeleteCampaignPrivileges:", error);
    throw new InternalServerError(
      "Failed to check campaign delete privileges from database",
      {
        operation: "checkDeleteCampaignPrivileges",
      },
    );
  }
}

export async function campaignExists(data: { campaign_id: number }) {
  try {
    const rows = await query<campaignRowSchema>(
      `
        SELECT id FROM campaigns
        WHERE id = ?
      `,
      [data.campaign_id],
    );

    return rows.length > 0;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in campaignExists:", error);
      throw new InternalServerError("Failed to check campaign.", {
        operation: "campaignExists",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in campaignExists:", error);
    throw new InternalServerError("Failed to check campaign from database", {
      operation: "campaignExists",
    });
  }
}

export async function getCampaignsForOrganization(data: {
  user_id: number | null;
  organization_id: number;
  exclude_campaign_id?: number;
}) {
  try {
    const rows = await query<campaignResponseSchema>(
      `
      SELECT DISTINCT
        c.*,
        COALESCE(sc.signatures, 0) AS signatures,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        o.name as organization_name
      FROM campaigns AS c
        LEFT JOIN users AS u ON c.creator_id = u.id
        LEFT JOIN organizations AS o ON c.organization_id = o.id
        LEFT JOIN (
          SELECT campaign_id, COUNT(id) AS signatures
          FROM signatures
          GROUP BY campaign_id
        ) AS sc ON sc.campaign_id = c.id
        LEFT JOIN members AS m 
        ON c.organization_id = m.organization_id 
        AND m.user_id = ?
      WHERE c.organization_id = ?
        AND c.id != ?
        AND (
          c.is_public = 1
          OR c.creator_id = ?
          OR m.user_id IS NOT NULL
        )
      ORDER BY c.created_at DESC
      `,
      [data.user_id || null, data.organization_id, data.exclude_campaign_id || 0, data.user_id || null],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getCampaignsForOrganization:", error);
      throw new InternalServerError(
        "Failed to get campaigns. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "getCampaignsForOrganization",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCampaignsForOrganization:", error);
    throw new InternalServerError(
      "Failed to retrieve campaigns from database",
      {
        operation: "getCampaignsForOrganization",
      },
    );
  }
}

export async function getCampaignsBySignatures(data: { user_id: number | null }) {
  try {
    const rows = await query<campaignResponseSchema>(
      `
      SELECT DISTINCT
        c.*,
        COALESCE(sc.signatures, 0) AS signatures,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        o.name as organization_name
      FROM campaigns AS c
        LEFT JOIN users AS u ON c.creator_id = u.id
        LEFT JOIN organizations AS o ON c.organization_id = o.id
        LEFT JOIN (
          SELECT campaign_id, COUNT(id) AS signatures
          FROM signatures
          GROUP BY campaign_id
        ) AS sc ON sc.campaign_id = c.id
        LEFT JOIN members AS m 
        ON c.organization_id = m.organization_id 
        AND m.user_id = ?
      WHERE c.is_public = 1
        OR c.creator_id = ?
        OR m.user_id IS NOT NULL
      ORDER BY COALESCE(sc.signatures, 0) DESC
      LIMIT 15
      `,
      [data.user_id || null, data.user_id || null],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getCampaignsBySignatures:", error);
      throw new InternalServerError(
        "Failed to get campaigns. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "getCampaignsBySignatures",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCampaignsBySignatures:", error);
    throw new InternalServerError(
      "Failed to retrieve campaigns from database",
      {
        operation: "getCampaignsBySignatures",
      },
    );
  }
}

export async function getCampaignsFromUserOrganizations(data: { user_id: number }) {
  try {
    const rows = await query<campaignResponseSchema>(
      `
      SELECT DISTINCT
        c.*,
        COALESCE(sc.signatures, 0) AS signatures,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        o.name as organization_name
      FROM campaigns AS c
        LEFT JOIN users AS u ON c.creator_id = u.id
        LEFT JOIN organizations AS o ON c.organization_id = o.id
        LEFT JOIN (
          SELECT campaign_id, COUNT(id) AS signatures
          FROM signatures
          GROUP BY campaign_id
        ) AS sc ON sc.campaign_id = c.id
        INNER JOIN members AS m 
        ON c.organization_id = m.organization_id 
        AND m.user_id = ?
      WHERE (c.is_public = 1 OR c.creator_id = ? OR m.is_moderator = 1 OR m.is_owner = 1)
      ORDER BY c.created_at DESC
      LIMIT 15
      `,
      [data.user_id, data.user_id],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getCampaignsFromUserOrganizations:", error);
      throw new InternalServerError(
        "Failed to get campaigns. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "getCampaignsFromUserOrganizations",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCampaignsFromUserOrganizations:", error);
    throw new InternalServerError(
      "Failed to retrieve campaigns from database",
      {
        operation: "getCampaignsFromUserOrganizations",
      },
    );
  }
}

export async function getCampaignsWithoutOrganization(data: { user_id: number | null }) {
  try {
    const rows = await query<campaignResponseSchema>(
      `
      SELECT DISTINCT
        c.*,
        COALESCE(sc.signatures, 0) AS signatures,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        o.name as organization_name
      FROM campaigns AS c
        LEFT JOIN users AS u ON c.creator_id = u.id
        LEFT JOIN organizations AS o ON c.organization_id = o.id
        LEFT JOIN (
          SELECT campaign_id, COUNT(id) AS signatures
          FROM signatures
          GROUP BY campaign_id
        ) AS sc ON sc.campaign_id = c.id
        LEFT JOIN members AS m 
        ON c.organization_id = m.organization_id 
        AND m.user_id = ?
      WHERE c.organization_id IS NULL
        AND (c.is_public = 1 OR c.creator_id = ? OR m.user_id IS NOT NULL)
      ORDER BY c.created_at DESC
      LIMIT 15
      `,
      [data.user_id || null, data.user_id || null],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getCampaignsWithoutOrganization:", error);
      throw new InternalServerError(
        "Failed to get campaigns. Please ensure all provided organization and campaign data are valid.",
        {
          operation: "getCampaignsWithoutOrganization",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getCampaignsWithoutOrganization:", error);
    throw new InternalServerError(
      "Failed to retrieve campaigns from database",
      {
        operation: "getCampaignsWithoutOrganization",
      },
    );
  }
}

export async function deleteCampaign(data: { id: number }) {
  try {
    // First delete dependent records
    await query(
      `
      DELETE FROM favorites
      WHERE campaign_id = ?
      `,
      [data.id],
    );

    await query(
      `
      DELETE FROM comments
      WHERE campaign_id = ?
      `,
      [data.id],
    );

    await query(
      `
      DELETE FROM signatures
      WHERE campaign_id = ?
      `,
      [data.id],
    );

    // Delete the campaign and get the result to check if it existed
    const result = await query<any>(
      `
      DELETE FROM campaigns
      WHERE id = ?
      `,
      [data.id],
    );

    // Return true if a campaign was deleted, false if it didn't exist
    return result.length > 0;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteCampaign:", error);
      throw new InternalServerError("Failed to delete campaign.", {
        operation: "deleteCampaign",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteCampaign:", error);
    throw new InternalServerError("Failed to delete campaign from database", {
      operation: "deleteCampaign",
    });
  }
}
