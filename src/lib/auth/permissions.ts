import { UnauthorizedError, NotFoundError } from "../errors/ApiError";
import { searchMemberOfOrganization } from "../db/members";
import { campaignExists } from "../db/campaigns";
import { getOrganization } from "../db/organizations";
import { getUserById } from "../db/users";
import { query } from "../db/query";
import { userRowSchema } from "../schemas/users";

/**
 * Central permission checking module
 * All permission checks should go through these functions
 * Superusers (is_admin = true) bypass all checks
 */

/**
 * Check if user is a superuser (admin)
 * Superusers can perform any action
 */
export async function isSuperUser(userId: number): Promise<boolean> {
  try {
    const user = await getUserById({ userId });
    return user ? user.is_admin : false;
  } catch {
    return false;
  }
}

/**
 * Ensure user is a superuser, throw otherwise
 */
export async function requireSuperUser(userId: number): Promise<void> {
  const isAdmin = await isSuperUser(userId);
  if (!isAdmin) {
    throw new UnauthorizedError(
      "This action requires administrative privileges.",
    );
  }
}

/**
 * Check if user is campaign creator
 * Superusers always return true
 */
export async function isCampaignCreator(
  userId: number,
  campaignId: number,
): Promise<boolean> {
  if (await isSuperUser(userId)) return true;

  try {
    const exists = await campaignExists({ campaign_id: campaignId });
    if (!exists) return false;

    // Query to check if user is creator
    const rows = await query<{ is_creator: number }>(
      `SELECT 1 as is_creator FROM campaigns WHERE id = ? AND creator_id = ?`,
      [campaignId, userId],
    );
    return rows && rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Ensure user is campaign creator, throw otherwise
 * Superusers always pass
 */
export async function requireCampaignCreator(
  userId: number,
  campaignId: number,
): Promise<void> {
  const isCreator = await isCampaignCreator(userId, campaignId);
  if (!isCreator) {
    throw new UnauthorizedError(
      "You don't have permission to perform this action on this campaign.",
    );
  }
}

/**
 * Check if user is organization member
 * Superusers always return true
 */
export async function isOrganizationMember(
  userId: number,
  organizationId: number,
): Promise<boolean> {
  if (await isSuperUser(userId)) return true;

  const member = await searchMemberOfOrganization({
    user_id: userId,
    organization_id: organizationId,
  });

  return member !== null && member !== undefined;
}

/**
 * Ensure user is organization member, throw otherwise
 * Superusers always pass
 */
export async function requireOrganizationMember(
  userId: number,
  organizationId: number,
): Promise<void> {
  const isMember = await isOrganizationMember(userId, organizationId);
  if (!isMember) {
    throw new UnauthorizedError(
      "You are not a member of this organization.",
    );
  }
}

/**
 * Check if user is organization moderator or owner
 * Superusers always return true
 */
export async function isOrganizationModeratorOrOwner(
  userId: number,
  organizationId: number,
): Promise<boolean> {
  if (await isSuperUser(userId)) return true;

  const member = await searchMemberOfOrganization({
    user_id: userId,
    organization_id: organizationId,
  });

  if (!member) return false;
  return member.is_moderator || member.is_owner ? true : false;
}

/**
 * Ensure user is organization moderator or owner, throw otherwise
 * Superusers always pass
 */
export async function requireOrganizationModeratorOrOwner(
  userId: number,
  organizationId: number,
): Promise<void> {
  const isModOrOwner = await isOrganizationModeratorOrOwner(userId, organizationId);
  if (!isModOrOwner) {
    throw new UnauthorizedError(
      "You must be a moderator or owner of this organization.",
    );
  }
}

/**
 * Check if user is organization owner
 * Superusers always return true
 */
export async function isOrganizationOwner(
  userId: number,
  organizationId: number,
): Promise<boolean> {
  if (await isSuperUser(userId)) return true;

  const member = await searchMemberOfOrganization({
    user_id: userId,
    organization_id: organizationId,
  });

  return member && member.is_owner ? true : false;
}

/**
 * Ensure user is organization owner, throw otherwise
 * Superusers always pass
 */
export async function requireOrganizationOwner(
  userId: number,
  organizationId: number,
): Promise<void> {
  const isOwner = await isOrganizationOwner(userId, organizationId);
  if (!isOwner) {
    throw new UnauthorizedError(
      "You must be an owner of this organization.",
    );
  }
}

/**
 * Check if user can moderate comments in a campaign
 * User can moderate if they are:
 * - Superuser, OR
 * - Campaign creator, OR
 * - Moderator/Owner of the campaign's organization
 */
export async function canModerateComments(
  userId: number,
  campaignId: number,
): Promise<boolean> {
  if (await isSuperUser(userId)) return true;

  // Check if campaign creator
  if (await isCampaignCreator(userId, campaignId)) return true;

  // Check if moderator/owner of organization
  try {
    const rows = await query<{ organization_id: number }>(
      `SELECT organization_id FROM campaigns WHERE id = ?`,
      [campaignId],
    );

    if (rows && rows.length > 0) {
      const orgId = rows[0].organization_id;
      if (orgId) {
        return await isOrganizationModeratorOrOwner(userId, orgId);
      }
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Ensure user can moderate comments in campaign, throw otherwise
 * Superusers always pass
 */
export async function requireCommentModeration(
  userId: number,
  campaignId: number,
): Promise<void> {
  const canModerate = await canModerateComments(userId, campaignId);
  if (!canModerate) {
    throw new UnauthorizedError(
      "You don't have permission to moderate comments in this campaign.",
    );
  }
}

/**
 * Check if user can delete a comment
 * User can delete if they are:
 * - Superuser, OR
 * - Comment creator, OR
 * - Campaign creator, OR
 * - Moderator/Owner of the campaign's organization
 */
export async function canDeleteComment(
  userId: number,
  commentId: number,
  campaignId: number,
): Promise<boolean> {
  if (await isSuperUser(userId)) return true;

  try {
    // Check if user is comment creator
    const commentRows = await query<{ user_id: number }>(
      `SELECT user_id FROM comments WHERE id = ? AND campaign_id = ?`,
      [commentId, campaignId],
    );

    if (commentRows && commentRows.length > 0) {
      if (commentRows[0].user_id === userId) return true;
    }

    // Check if campaign creator or organization mod/owner
    return await canModerateComments(userId, campaignId);
  } catch {
    return false;
  }
}

/**
 * Ensure user can delete a comment, throw otherwise
 * Superusers always pass
 */
export async function requireCommentDelete(
  userId: number,
  commentId: number,
  campaignId: number,
): Promise<void> {
  const canDelete = await canDeleteComment(userId, commentId, campaignId);
  if (!canDelete) {
    throw new UnauthorizedError(
      "You don't have permission to delete this comment.",
    );
  }
}

/**
 * Check if user can access (view) a campaign
 * User can access if campaign is:
 * - Public, OR
 * - Created by user, OR
 * - User is member of the campaign's organization, OR
 * - User is superuser
 */
export async function canAccessCampaign(
  userId: number | null,
  campaignId: number,
): Promise<boolean> {
  if (userId && (await isSuperUser(userId))) return true;

  try {
    const rows = await query<{ is_public: number }>(
      `SELECT is_public FROM campaigns WHERE id = ?`,
      [campaignId],
    );

    if (!rows || rows.length === 0) return false;

    // Public campaigns are always accessible
    if (rows[0].is_public) return true;

    // If no user, only public campaigns are accessible
    if (!userId) return false;

    // Check if user is creator
    if (await isCampaignCreator(userId, campaignId)) return true;

    // Check if user is member of organization
    const membershipRows = await query<{ org_id: number }>(
      `
      SELECT c.organization_id as org_id
      FROM campaigns c
      LEFT JOIN members m ON c.organization_id = m.organization_id AND m.user_id = ?
      WHERE c.id = ? AND m.user_id IS NOT NULL
      `,
      [userId, campaignId],
    );

    return membershipRows && membershipRows.length > 0;
  } catch {
    return false;
  }
}

/**
 * Ensure user can access campaign, throw otherwise
 */
export async function requireCampaignAccess(
  userId: number | null,
  campaignId: number,
): Promise<void> {
  const canAccess = await canAccessCampaign(userId, campaignId);
  if (!canAccess) {
    throw new NotFoundError(
      "Campaign not found",
    );
  }
}

/**
 * Check if user can delete a campaign
 * User can delete if they are:
 * - Superuser, OR
 * - Campaign creator
 */
export async function canDeleteCampaign(
  userId: number,
  campaignId: number,
): Promise<boolean> {
  if (await isSuperUser(userId)) return true;
  return await isCampaignCreator(userId, campaignId);
}

/**
 * Ensure user can delete campaign, throw otherwise
 * Superusers always pass
 */
export async function requireCampaignDelete(
  userId: number,
  campaignId: number,
): Promise<void> {
  const canDelete = await canDeleteCampaign(userId, campaignId);
  if (!canDelete) {
    throw new UnauthorizedError(
      "You don't have permission to delete this campaign.",
    );
  }
}

/**
 * Check if user can delete organization
 * User can delete if they are:
 * - Superuser, OR
 * - Organization creator
 */
export async function canDeleteOrganization(
  userId: number,
  organizationId: number,
): Promise<boolean> {
  if (await isSuperUser(userId)) return true;

  try {
    const rows = await query<{ creator_id: number }>(
      `SELECT creator_id FROM organizations WHERE id = ?`,
      [organizationId],
    );

    return rows && rows.length > 0 && rows[0].creator_id === userId;
  } catch {
    return false;
  }
}

/**
 * Ensure user can delete organization, throw otherwise
 * Superusers always pass
 */
export async function requireOrganizationDelete(
  userId: number,
  organizationId: number,
): Promise<void> {
  const canDelete = await canDeleteOrganization(userId, organizationId);
  if (!canDelete) {
    throw new UnauthorizedError(
      "You don't have permission to delete this organization.",
    );
  }
}
