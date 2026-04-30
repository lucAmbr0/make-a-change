import { UnauthorizedError, NotFoundError } from "../errors/ApiError";
import { searchMemberOfOrganization } from "../db/members";
import { campaignExists } from "../db/campaigns";
import { getUserById } from "../db/users";
import { query } from "../db/query";
import type { RequestCtx } from "./ctx";

/**
 * Central permission checking module
 * All permission checks should go through these functions.
 * Superusers (is_admin = true) bypass all checks.
 *
 * Every function accepts an optional `ctx` to memoize lookups for the
 * duration of one request. Pass the same ctx through chained checks to
 * avoid redundant DB queries (e.g. canDeleteComment → canModerateComments
 * → isCampaignCreator → isSuperUser).
 */

async function memo<T>(
  ctx: RequestCtx | undefined,
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  if (!ctx) return loader();
  if (ctx.cache.has(key)) return ctx.cache.get(key) as T;
  const value = await loader();
  ctx.cache.set(key, value);
  return value;
}

export async function isSuperUser(
  userId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  return memo(ctx, `superUser:${userId}`, async () => {
    try {
      const user = await getUserById({ userId });
      return user ? user.is_admin : false;
    } catch {
      return false;
    }
  });
}

export async function requireSuperUser(
  userId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await isSuperUser(userId, ctx))) {
    throw new UnauthorizedError(
      "This action requires administrative privileges.",
    );
  }
}

export async function isCampaignCreator(
  userId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;

  return memo(ctx, `campaignCreator:${userId}:${campaignId}`, async () => {
    try {
      const exists = await campaignExists({ campaign_id: campaignId });
      if (!exists) return false;

      const rows = await query<{ is_creator: number }>(
        `SELECT 1 as is_creator FROM campaigns WHERE id = ? AND creator_id = ?`,
        [campaignId, userId],
      );
      return rows && rows.length > 0;
    } catch {
      return false;
    }
  });
}

export async function requireCampaignCreator(
  userId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await isCampaignCreator(userId, campaignId, ctx))) {
    throw new UnauthorizedError(
      "You don't have permission to perform this action on this campaign.",
    );
  }
}

async function getMembership(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
) {
  return memo(ctx, `member:${userId}:${organizationId}`, () =>
    searchMemberOfOrganization({
      user_id: userId,
      organization_id: organizationId,
    }),
  );
}

export async function isOrganizationMember(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;
  const member = await getMembership(userId, organizationId, ctx);
  return member !== null && member !== undefined;
}

export async function requireOrganizationMember(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await isOrganizationMember(userId, organizationId, ctx))) {
    throw new UnauthorizedError(
      "You are not a member of this organization.",
    );
  }
}

export async function isOrganizationModeratorOrOwner(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;
  const member = await getMembership(userId, organizationId, ctx);
  if (!member) return false;
  return Boolean(member.is_moderator || member.is_owner);
}

export async function requireOrganizationModeratorOrOwner(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await isOrganizationModeratorOrOwner(userId, organizationId, ctx))) {
    throw new UnauthorizedError(
      "You must be a moderator or owner of this organization.",
    );
  }
}

export async function isOrganizationOwner(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;
  const member = await getMembership(userId, organizationId, ctx);
  return Boolean(member && member.is_owner);
}

export async function requireOrganizationOwner(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await isOrganizationOwner(userId, organizationId, ctx))) {
    throw new UnauthorizedError("You must be an owner of this organization.");
  }
}

async function getCampaignOrganizationId(
  campaignId: number,
  ctx?: RequestCtx,
): Promise<number | null> {
  return memo(ctx, `campaignOrg:${campaignId}`, async () => {
    try {
      const rows = await query<{ organization_id: number | null }>(
        `SELECT organization_id FROM campaigns WHERE id = ?`,
        [campaignId],
      );
      return rows && rows.length > 0 ? rows[0].organization_id : null;
    } catch {
      return null;
    }
  });
}

export async function canModerateComments(
  userId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;
  if (await isCampaignCreator(userId, campaignId, ctx)) return true;

  const orgId = await getCampaignOrganizationId(campaignId, ctx);
  if (!orgId) return false;
  return await isOrganizationModeratorOrOwner(userId, orgId, ctx);
}

export async function requireCommentModeration(
  userId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await canModerateComments(userId, campaignId, ctx))) {
    throw new UnauthorizedError(
      "You don't have permission to moderate comments in this campaign.",
    );
  }
}

export async function canDeleteComment(
  userId: number,
  commentId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;

  try {
    const commentRows = await memo(
      ctx,
      `commentAuthor:${commentId}:${campaignId}`,
      () =>
        query<{ user_id: number }>(
          `SELECT user_id FROM comments WHERE id = ? AND campaign_id = ?`,
          [commentId, campaignId],
        ),
    );

    if (commentRows && commentRows.length > 0) {
      if (commentRows[0].user_id === userId) return true;
    }

    return await canModerateComments(userId, campaignId, ctx);
  } catch {
    return false;
  }
}

export async function requireCommentDelete(
  userId: number,
  commentId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await canDeleteComment(userId, commentId, campaignId, ctx))) {
    throw new UnauthorizedError(
      "You don't have permission to delete this comment.",
    );
  }
}

export async function canAccessCampaign(
  userId: number | null,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (userId && (await isSuperUser(userId, ctx))) return true;

  try {
    const rows = await memo(ctx, `campaignVisibility:${campaignId}`, () =>
      query<{ is_public: number }>(
        `SELECT is_public FROM campaigns WHERE id = ?`,
        [campaignId],
      ),
    );

    if (!rows || rows.length === 0) return false;
    if (rows[0].is_public) return true;
    if (!userId) return false;

    if (await isCampaignCreator(userId, campaignId, ctx)) return true;

    const orgId = await getCampaignOrganizationId(campaignId, ctx);
    if (!orgId) return false;
    return await isOrganizationMember(userId, orgId, ctx);
  } catch {
    return false;
  }
}

export async function requireCampaignAccess(
  userId: number | null,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await canAccessCampaign(userId, campaignId, ctx))) {
    throw new NotFoundError("Campaign not found");
  }
}

export async function canDeleteCampaign(
  userId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;
  return await isCampaignCreator(userId, campaignId, ctx);
}

export async function canEditCampaign(
  userId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;
  if (await isCampaignCreator(userId, campaignId, ctx)) return true;

  const orgId = await getCampaignOrganizationId(campaignId, ctx);
  if (!orgId) return false;
  return await isOrganizationModeratorOrOwner(userId, orgId, ctx);
}

export async function requireCampaignEdit(
  userId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await canEditCampaign(userId, campaignId, ctx))) {
    throw new UnauthorizedError(
      "You don't have permission to edit this campaign.",
    );
  }
}

export async function requireCampaignDelete(
  userId: number,
  campaignId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await canDeleteCampaign(userId, campaignId, ctx))) {
    throw new UnauthorizedError(
      "You don't have permission to delete this campaign.",
    );
  }
}

export async function canDeleteOrganization(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
): Promise<boolean> {
  if (await isSuperUser(userId, ctx)) return true;

  return memo(ctx, `orgCreator:${organizationId}:${userId}`, async () => {
    try {
      const rows = await query<{ creator_id: number }>(
        `SELECT creator_id FROM organizations WHERE id = ?`,
        [organizationId],
      );
      return Boolean(rows && rows.length > 0 && rows[0].creator_id === userId);
    } catch {
      return false;
    }
  });
}

export async function requireOrganizationDelete(
  userId: number,
  organizationId: number,
  ctx?: RequestCtx,
): Promise<void> {
  if (!(await canDeleteOrganization(userId, organizationId, ctx))) {
    throw new UnauthorizedError(
      "You don't have permission to delete this organization.",
    );
  }
}
