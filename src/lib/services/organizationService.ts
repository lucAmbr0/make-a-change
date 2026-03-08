import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { requireAuth } from "../auth/auth";
import { ValidationError } from "../errors/ApiError";
import {
  createOrganizationInput,
  organizationNameSchema,
  organizationRowSchema,
} from "../schemas/organization";
import { getOrganizationsNames, insertOrganization } from "../db/organizations";

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

  const campaign: organizationRowSchema = await insertOrganization({
    creator_id: auth.userId,
    name: input.name,
    description: input.description || null,
    created_at: creation_date,
    cover_path: input.cover_path || null,
    is_public: input.is_public,
    requires_approval: input.requires_approval,
  });

  return campaign;
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
