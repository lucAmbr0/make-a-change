import {
  authGetOrganization,
  authDeleteOrganization,
} from "@/lib/services/organizationService";
import { route } from "@/lib/api/handler";
import { parseIntParam } from "@/lib/api/params";

type Params = { id: string };

export const GET = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  return await authGetOrganization(ctx, organizationId);
});

export const DELETE = route<Params>(async (ctx, { id }) => {
  const organizationId = parseIntParam(id, "organization id");
  await authDeleteOrganization(ctx, organizationId);
  return null;
});
