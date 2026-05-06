import { requireAuthCtx } from "../auth/auth";
import type { RequestCtx } from "../auth/ctx";
import { ConflictError, NotFoundError } from "../errors/ApiError";
import {
  addRepostInput,
  removeRepostInput,
} from "../schemas/reposts";
import {
  insertRepost,
  deleteRepost,
  getUserReposts,
  repostExists,
} from "../db/reposts";
import { getCampaign, getCampaignUnauthorized } from "../db/campaigns";
import { isSuperUser } from "../auth/permissions";
import { parseBody } from "../api/body";

async function ensureCampaignVisible(
  ctx: RequestCtx,
  userId: number,
  campaignId: number,
) {
  const isAdmin = await isSuperUser(userId, ctx);
  const campaign = isAdmin
    ? await getCampaignUnauthorized({ campaign_id: campaignId })
    : await getCampaign({ user_id: userId, campaign_id: campaignId });

  if (!campaign) {
    throw new NotFoundError(
      "Campaign not found. Please ensure the campaign exists and you have access to it.",
    );
  }
  return campaign;
}

export async function getUserRepostsService(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  return await getUserReposts({ user_id: auth.userId });
}

export async function addRepostService(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, addRepostInput);

  await ensureCampaignVisible(ctx, auth.userId, input.campaign_id);

  const alreadyReposted = await repostExists({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  if (alreadyReposted) {
    throw new ConflictError("This campaign is already reposted.");
  }

  await insertRepost({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  return { user_id: auth.userId, campaign_id: input.campaign_id };
}

export async function removeRepostService(ctx: RequestCtx) {
  const auth = requireAuthCtx(ctx);
  const input = await parseBody(ctx, removeRepostInput);

  await ensureCampaignVisible(ctx, auth.userId, input.campaign_id);

  const isReposted = await repostExists({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  if (!isReposted) {
    throw new NotFoundError("This campaign is not reposted.");
  }

  await deleteRepost({
    user_id: auth.userId,
    campaign_id: input.campaign_id,
  });

  return true;
}
