import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { getTokenFromRequest, requireAuth } from "../auth/auth";
import { NotFoundError, ValidationError } from "../errors/ApiError";
import {
  createOrganizationInput,
  organizationNameSchema,
  organizationResponseSchema,
  organizationRowSchema,
} from "../schemas/organization";
import {
  getOrganization,
  getOrganizationsForUser,
  getOrganizationsNames,
  insertOrganization,
} from "../db/organizations";
import { insertMember } from "../db/members";
import { memberRowSchema } from "../schemas/members";

export async function createOrganization(req: NextRequest) {
  const auth = requireAuth(req);

  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  // Validate input against schema
  let input;
  try {
    input = createOrganizationInput.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError("Validation failed", {
        errors: error.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }
    throw error;
  }

  await organizationNamesExists(input.name);

  const creation_date = new Date();

  // Create organization
  const organization: organizationRowSchema = await insertOrganization({
    creator_id: auth.userId,
    name: input.name,
    description: input.description || null,
    created_at: creation_date,
    cover_path: input.cover_path || null,
    is_public: input.is_public,
    requires_approval: input.requires_approval,
  });

  // Once organization is created, add the creator as member and owner
  const member: memberRowSchema = await insertMember({
    user_id: auth.userId,
    organization_id: organization.id,
    is_moderator: true,
    is_owner: true,
  });

  return organization;
}

async function organizationNamesExists(name: string) {
  const organizationNames: organizationNameSchema[] =
    await getOrganizationsNames();

  if (organizationNames.some((org: { name: string }) => org.name === name)) {
    throw new ValidationError("Organization name already exists", {
      error: "An organization with this name already exists",
    });
  }
  return false;
}

export async function getAuthorizedOrganizations(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const auth = token ? requireAuth(req) : { userId: null };
  let organizations: organizationRowSchema[];
  organizations = await getOrganizationsForUser({ user_id: auth.userId });
  return organizations;
}

export async function authGetOrganization(
  req: NextRequest,
  organizationId: number,
) {
  const token = getTokenFromRequest(req);
  const auth = token ? requireAuth(req) : { userId: null };
  let organization: organizationResponseSchema;
  organization = await getOrganization({
    user_id: auth.userId,
    organization_id: organizationId,
  });

  if (!organization || organization === null) {
    throw new NotFoundError("Organization not found.");
  }

  return organization;
}
