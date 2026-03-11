import { InternalServerError } from "../errors/ApiError";
import {
  signatureCountRowSchema,
  signatureRowSchema,
} from "../schemas/signatures";
import { DBError, query } from "./query";

export async function getAuthorizedCampaignSignaturesCount(data: {
  user_id: number | null;
  campaign_id: number;
}) {
  try {
    const rows = await query<signatureCountRowSchema>(
      `
      SELECT COUNT(s.id) AS count
      FROM campaigns AS c
      LEFT JOIN signatures AS s ON s.campaign_id = c.id
      LEFT JOIN members AS m
        ON c.organization_id = m.organization_id
        AND m.user_id = ?
      WHERE
        c.id = ?
        AND (
          c.is_public = 1
          OR c.creator_id = ?
          OR m.user_id IS NOT NULL
        )
      GROUP BY c.id
      `,
      [data.user_id || null, data.campaign_id, data.user_id || null],
    );

    if (!rows || rows.length === 0) {
      return null;
    }

    return rows[0].count;
  } catch (error) {
    if (error instanceof DBError) {
      console.error(
        "Database error in getAuthorizedCampaignSignaturesCount:",
        error,
      );
      throw new InternalServerError("Failed to retrieve signatures count.", {
        operation: "getAuthorizedCampaignSignaturesCount",
        dbCode: error.code,
      });
    }
    console.error(
      "Unexpected error in getAuthorizedCampaignSignaturesCount:",
      error,
    );
    throw new InternalServerError(
      "Failed to retrieve signatures count from database",
      {
        operation: "getAuthorizedCampaignSignaturesCount",
      },
    );
  }
}

export async function getUserSignatureInCampaign(data: {
  signer_id: number;
  campaign_id: number;
}) {
  try {
    const rows = await query<signatureRowSchema>(
      `
      SELECT *
      FROM signatures
      WHERE signer_id = ? AND campaign_id = ?
      `,
      [data.signer_id, data.campaign_id],
    );

    return rows[0] || null;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getUserSignatureInCampaign:", error);
      throw new InternalServerError("Failed to check existing signature.", {
        operation: "getUserSignatureInCampaign",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in getUserSignatureInCampaign:", error);
    throw new InternalServerError(
      "Failed to check existing signature from database",
      {
        operation: "getUserSignatureInCampaign",
      },
    );
  }
}

export async function insertSignature(data: {
  checksum: string;
  signer_id: number;
  campaign_id: number;
}) {
  try {
    const rows = await query<signatureRowSchema>(
      `
      INSERT INTO signatures
        (
          checksum,
          signer_id,
          campaign_id
        )
      VALUES (?,?,?)
      RETURNING *
      `,
      [data.checksum, data.signer_id, data.campaign_id],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Signature creation failed: no rows returned",
        {
          operation: "insertSignature",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in insertSignature:", error);
      throw new InternalServerError("Failed to create signature.", {
        operation: "insertSignature",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in insertSignature:", error);
    throw new InternalServerError("Failed to insert signature into database", {
      operation: "insertSignature",
    });
  }
}

export async function deleteSignatureByUserInCampaign(data: {
  signer_id: number;
  campaign_id: number;
}) {
  try {
    await query(
      `
      DELETE FROM signatures
      WHERE signer_id = ? AND campaign_id = ?
      `,
      [data.signer_id, data.campaign_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error(
        "Database error in deleteSignatureByUserInCampaign:",
        error,
      );
      throw new InternalServerError("Failed to delete signature.", {
        operation: "deleteSignatureByUserInCampaign",
        dbCode: error.code,
      });
    }
    console.error(
      "Unexpected error in deleteSignatureByUserInCampaign:",
      error,
    );
    throw new InternalServerError("Failed to delete signature from database", {
      operation: "deleteSignatureByUserInCampaign",
    });
  }
}
