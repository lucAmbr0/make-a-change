import { InternalServerError } from "../errors/ApiError";
import { campaignRowSchema } from "../schemas/campaigns";
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

export async function getCampaignsForUser(data: { user_id: number | null}) {
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
    throw new InternalServerError("Failed to retrieve campaigns from database", {
      operation: "getCampaignsForUser",
    });
  }
}
