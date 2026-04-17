import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { getTokenFromRequest, requireAuth } from "../auth/auth";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/ApiError";
import {
  getMembersCount,
  getMembersList,
  insertMember,
  searchMemberOfOrganization,
} from "../db/members";
import {
  createMemberInput,
  memberResponseSchema,
  memberRowSchema,
} from "../schemas/members";
import { getOrganization } from "../db/organizations";
import { organizationResponseSchema } from "../schemas/organization";
import { 
  requireOrganizationModeratorOrOwner,
  isSuperUser 
} from "../auth/permissions";

export async function addMemberForUser(
  userId: number,
  organizationId: number,
  input: createMemberInput = {},
) {
  // Check if user is already a member of the organization
  if (
    await searchMemberOfOrganization({
      organization_id: organizationId,
      user_id: userId,
    })
  ) {
    throw new ValidationError("User is already a member of this organization", {
      error: "Duplicate member",
    });
  }

  const member: memberRowSchema = await insertMember({
    organization_id: organizationId,
    user_id: userId,
    is_moderator: input.is_moderator,
    is_owner: input.is_owner,
  });

  return member;
}

export async function addMember(req: NextRequest, organizationId: number) {
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
    input = createMemberInput.parse(body);
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

  const member = await addMemberForUser(auth.userId, organizationId, input);

  return member;
}

export async function requireModeratorOrOwner(
  userId: number,
  organizationId: number,
) {
  // Use centralized permission system (includes superuser bypass)
  await requireOrganizationModeratorOrOwner(userId, organizationId);
}

export async function authDeleteMember(
  req: NextRequest,
  organizationId: number,
) {
  const auth = requireAuth(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError("Invalid JSON in request body", {
      error: "Request body must be valid JSON",
    });
  }

  let input;
  try {
    const { deleteMemberInput } = await import("../schemas/members");
    input = deleteMemberInput.parse(body);
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

  const targetUserId = input.user_id;

  // Check if target member exists
  const memberToRemove = await searchMemberOfOrganization({
    organization_id: organizationId,
    user_id: targetUserId,
  });

  if (!memberToRemove) {
    throw new NotFoundError("Member not found in this organization.");
  }

  // If the authenticated user is removing someone else, they must be moderator or owner
  if (auth.userId !== targetUserId) {
    await requireModeratorOrOwner(auth.userId, organizationId);
  }

  // Delete the member
  const { deleteMember } = await import("../db/members");
  await deleteMember({
    user_id: targetUserId,
    organization_id: organizationId,
  });

  return true;
}

export async function getMember(userId: number, organizationId: number) {
  const member: memberRowSchema | null = await searchMemberOfOrganization({
    organization_id: organizationId,
    user_id: userId,
  });

  if (!member) return null;

  return member;
}

export async function isMember(userId: number, organizationId: number) {
  const member: memberRowSchema | null = await searchMemberOfOrganization({
    organization_id: organizationId,
    user_id: userId,
  });

  if (!member) return false;

  return true;
}

export async function authGetMembersList(
  req: NextRequest,
  organizationId: number,
) {
  const token = getTokenFromRequest(req);
  const auth = token ? requireAuth(req) : { userId: null };
  const organization : organizationResponseSchema =
  await getOrganization({
    user_id: auth.userId,
    organization_id: organizationId,
  });

  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  let members: memberResponseSchema[];
  members = await getMembersList({ organization_id: organization.id });
  return members;
}

export async function authGetMembersCount(
  req: NextRequest,
  organizationId: number
) {
  const token = getTokenFromRequest(req);
  const auth = token ? requireAuth(req) : { userId: null };
  const organization : organizationResponseSchema =
  await getOrganization({
    user_id: auth.userId,
    organization_id: organizationId,
  });

  if (!organization) {
    throw new NotFoundError("Organization not found");
  }

  let members: number;
  members = await getMembersCount({ organization_id: organization.id });
  return members;
}