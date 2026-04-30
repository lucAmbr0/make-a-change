import {
  createOrganization,
  getAuthorizedOrganizations,
} from "@/lib/services/organizationService";
import { route } from "@/lib/api/handler";

export const GET = route(async (ctx) => {
  return await getAuthorizedOrganizations(ctx);
});

export const POST = route(async (ctx) => {
  return await createOrganization(ctx);
});
