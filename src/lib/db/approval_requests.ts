import { InternalServerError } from "../errors/ApiError";
import {
  approvalRequestResponseSchema,
  approvalRequestRowSchema,
} from "../schemas/approval_requests";
import { DBError, query } from "./query";

export async function insertApprovalRequest(data: {
  user_id: number;
  organization_id: number;
  requested_at: Date;
}) {
  try {
    const rows = await query<approvalRequestRowSchema>(
      `
      INSERT INTO approval_requests
        (
          user_id,
          organization_id,
          requested_at
        )
      VALUES (?,?,?)
      RETURNING *
      `,
      [data.user_id, data.organization_id, data.requested_at],
    );

    if (!rows || rows.length === 0) {
      throw new InternalServerError(
        "Approval request creation failed: no rows returned",
        {
          operation: "insertApprovalRequest",
        },
      );
    }

    return rows[0];
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in insertApprovalRequest:", error);
      throw new InternalServerError("Failed to create approval request.", {
        operation: "insertApprovalRequest",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in insertApprovalRequest:", error);
    throw new InternalServerError(
      "Failed to insert approval request into database",
      {
        operation: "insertApprovalRequest",
      },
    );
  }
}

export async function getApprovalRequest(data: {
  user_id: number;
  organization_id: number;
}) {
  try {
    const rows = await query<approvalRequestRowSchema>(
      `
      SELECT *
      FROM approval_requests
      WHERE user_id = ? AND organization_id = ?
      `,
      [data.user_id, data.organization_id],
    );

    return rows[0] || null;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getApprovalRequest:", error);
      throw new InternalServerError("Failed to retrieve approval request.", {
        operation: "getApprovalRequest",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in getApprovalRequest:", error);
    throw new InternalServerError(
      "Failed to retrieve approval request from database",
      {
        operation: "getApprovalRequest",
      },
    );
  }
}

export async function getApprovalRequestForUser(data: { user_id: number }) {
  try {
    const rows = await query<approvalRequestRowSchema>(
      `
      SELECT *
      FROM approval_requests
      WHERE user_id = ?
      ORDER BY requested_at ASC
      LIMIT 1
      `,
      [data.user_id],
    );

    return rows[0] || null;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in getApprovalRequestForUser:", error);
      throw new InternalServerError(
        "Failed to retrieve approval requests for user.",
        {
          operation: "getApprovalRequestForUser",
          dbCode: error.code,
        },
      );
    }
    console.error("Unexpected error in getApprovalRequestForUser:", error);
    throw new InternalServerError(
      "Failed to retrieve approval requests for user from database",
      {
        operation: "getApprovalRequestForUser",
      },
    );
  }
}

export async function getApprovalRequestsForOrganization(data: {
  organization_id: number;
}) {
  try {
    const rows = await query<approvalRequestResponseSchema>(
      `
      SELECT
        ar.*, 
        u.first_name AS user_first_name,
        u.last_name AS user_last_name
      FROM approval_requests AS ar
        JOIN users AS u ON u.id = ar.user_id
      WHERE ar.organization_id = ?
      ORDER BY ar.requested_at ASC
      `,
      [data.organization_id],
    );

    return rows;
  } catch (error) {
    if (error instanceof DBError) {
      console.error(
        "Database error in getApprovalRequestsForOrganization:",
        error,
      );
      throw new InternalServerError(
        "Failed to retrieve approval requests.",
        {
          operation: "getApprovalRequestsForOrganization",
          dbCode: error.code,
        },
      );
    }
    console.error(
      "Unexpected error in getApprovalRequestsForOrganization:",
      error,
    );
    throw new InternalServerError(
      "Failed to retrieve approval requests from database",
      {
        operation: "getApprovalRequestsForOrganization",
      },
    );
  }
}

export async function deleteApprovalRequest(data: {
  user_id: number;
  organization_id: number;
}) {
  try {
    await query(
      `
      DELETE FROM approval_requests
      WHERE user_id = ? AND organization_id = ?
      `,
      [data.user_id, data.organization_id],
    );

    return true;
  } catch (error) {
    if (error instanceof DBError) {
      console.error("Database error in deleteApprovalRequest:", error);
      throw new InternalServerError("Failed to delete approval request.", {
        operation: "deleteApprovalRequest",
        dbCode: error.code,
      });
    }
    console.error("Unexpected error in deleteApprovalRequest:", error);
    throw new InternalServerError(
      "Failed to delete approval request from database",
      {
        operation: "deleteApprovalRequest",
      },
    );
  }
}