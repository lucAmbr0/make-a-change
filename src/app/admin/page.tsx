"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";

type HttpMethod = "GET" | "POST" | "DELETE";
type Domain = "Auth" | "Campaigns" | "Organizations" | "Notifications";
type FieldType = "text" | "number" | "boolean" | "password" | "date" | "textarea";

interface SignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  birth_date: string;
  phone?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface CreateCampaignPayload {
  organization_id?: number;
  title: string;
  description?: string;
  cover_path?: string;
  signature_goal?: number;
  is_public: boolean;
  comments_active: boolean;
  comments_require_approval: boolean;
}

interface CampaignFavoritePayload {
  campaign_id: number;
}

interface CampaignCommentCreatePayload {
  text: string;
}

interface CampaignCommentDeletePayload {
  comment_id: number;
}

interface CampaignCommentModerationPayload {
  comment_approval: boolean;
}

interface CreateOrganizationPayload {
  name: string;
  description?: string;
  cover_path?: string;
  is_public: boolean;
  requires_approval: boolean;
}

interface JoinOrganizationPayload {
  organization_id?: number;
  organizationId?: number;
  invite_code?: string;
}

interface AddMemberPayload {
  is_moderator?: boolean;
  is_owner?: boolean;
}

interface RemoveMemberPayload {
  user_id: number;
}

interface CreateInviteCodePayload {
  uses: number;
  expires_at?: string;
}

interface DeleteInviteCodePayload {
  code: string;
}

interface ApprovalRequestPayload {
  user_id?: number;
  userId?: number;
  userI_id?: number;
  approval: boolean;
}

interface NotificationReadActionPayload {
  action: "read_notification" | "read_all";
  notification_id?: number;
}

interface NotificationDeleteActionPayload {
  action: "delete_notification" | "delete_all";
  notification_id?: number;
}

interface NotificationCreatePayload {
  type: "user" | "organization" | "campaign_signers" | "all_users";
  target_user_id?: number;
  organization_id?: number;
  campaign_id?: number;
  title: string;
  text: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  optional?: boolean;
  defaultValue?: string | number | boolean;
}

interface BodyVariant {
  id: string;
  label: string;
  body: Record<string, unknown>;
}

interface EndpointDefinition {
  id: string;
  domain: Domain;
  entityLabels: string[];
  title: string;
  method: HttpMethod;
  path: string;
  requiresAuth?: boolean;
  description?: string;
  pathParams?: Record<string, string>;
  supportsBody?: boolean;
  fields?: FieldConfig[];
  variants?: BodyVariant[];
  bodyType?:
    | "SignupPayload"
    | "LoginPayload"
    | "CreateCampaignPayload"
    | "CampaignFavoritePayload"
    | "CampaignCommentCreatePayload"
    | "CampaignCommentDeletePayload"
    | "CampaignCommentModerationPayload"
    | "CreateOrganizationPayload"
    | "JoinOrganizationPayload"
    | "AddMemberPayload"
    | "RemoveMemberPayload"
    | "CreateInviteCodePayload"
    | "DeleteInviteCodePayload"
    | "ApprovalRequestPayload"
    | "NotificationReadActionPayload"
    | "NotificationDeleteActionPayload"
    | "NotificationCreatePayload";
}

interface CardState {
  pathParams: Record<string, string>;
  bodyFields: Record<string, unknown>;
  useJsonEditor: boolean;
  jsonBody: string;
  selectedVariantId: string;
}

interface CardRuntime {
  loading: boolean;
  startedAt?: number;
}

interface ResponseView {
  ok: boolean;
  status: number;
  durationMs: number;
  headers: Record<string, string>;
  body: unknown;
  url: string;
  method: HttpMethod;
  receivedAt: string;
}

interface LogEntry {
  id: number;
  endpointTitle: string;
  method: HttpMethod;
  path: string;
  status: number;
  durationMs: number;
  ok: boolean;
  at: string;
}

const STORAGE_KEYS = {
  baseUrl: "admin_cp_base_url",
  token: "admin_cp_session_token",
  cookieMode: "admin_cp_cookie_mode",
};

const LOG_LIMIT = 60;

const ENDPOINTS: EndpointDefinition[] = [
  {
    id: "auth-signup",
    domain: "Auth",
    entityLabels: ["users"],
    title: "Create user account",
    description: "POST /api/auth/signup",
    method: "POST",
    path: "/api/auth/signup",
    supportsBody: true,
    bodyType: "SignupPayload",
    fields: [
      { key: "first_name", label: "first_name", type: "text", placeholder: "Ada" },
      { key: "last_name", label: "last_name", type: "text", placeholder: "Lovelace" },
      { key: "email", label: "email", type: "text", placeholder: "ada@example.com" },
      { key: "password", label: "password", type: "password", placeholder: "••••••••" },
      { key: "birth_date", label: "birth_date", type: "date" },
      { key: "phone", label: "phone", type: "text", optional: true, placeholder: "+1 555 000 1111" },
    ],
  },
  {
    id: "auth-login",
    domain: "Auth",
    entityLabels: ["users"],
    title: "Login",
    description: "POST /api/auth/login",
    method: "POST",
    path: "/api/auth/login",
    supportsBody: true,
    bodyType: "LoginPayload",
    fields: [
      { key: "email", label: "email", type: "text", placeholder: "ada@example.com" },
      { key: "password", label: "password", type: "password", placeholder: "••••••••" },
    ],
  },
  {
    id: "auth-me",
    domain: "Auth",
    entityLabels: ["users"],
    title: "Get current user",
    description: "GET /api/auth/me",
    method: "GET",
    path: "/api/auth/me",
    requiresAuth: true,
  },
  {
    id: "campaign-list",
    domain: "Campaigns",
    entityLabels: ["campaigns"],
    title: "List campaigns",
    method: "GET",
    path: "/api/campaign",
  },
  {
    id: "campaign-create",
    domain: "Campaigns",
    entityLabels: ["campaigns"],
    title: "Create campaign",
    method: "POST",
    path: "/api/campaign",
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CreateCampaignPayload",
    fields: [
      { key: "organization_id", label: "organization_id", type: "number", optional: true, placeholder: "1" },
      { key: "title", label: "title", type: "text", placeholder: "Save the Forest" },
      { key: "description", label: "description", type: "textarea", optional: true },
      { key: "cover_path", label: "cover_path", type: "text", optional: true, placeholder: "/covers/forest.png" },
      { key: "signature_goal", label: "signature_goal", type: "number", optional: true, placeholder: "1000" },
      { key: "is_public", label: "is_public", type: "boolean", defaultValue: true },
      { key: "comments_active", label: "comments_active", type: "boolean", defaultValue: true },
      {
        key: "comments_require_approval",
        label: "comments_require_approval",
        type: "boolean",
        defaultValue: false,
      },
    ],
  },
  {
    id: "campaign-get",
    domain: "Campaigns",
    entityLabels: ["campaigns"],
    title: "Get campaign by id",
    method: "GET",
    path: "/api/campaign/{id}",
    pathParams: { id: "1" },
  },
  {
    id: "campaign-delete",
    domain: "Campaigns",
    entityLabels: ["campaigns"],
    title: "Delete campaign",
    method: "DELETE",
    path: "/api/campaign/{id}",
    pathParams: { id: "1" },
    requiresAuth: true,
  },
  {
    id: "campaign-fav-list",
    domain: "Campaigns",
    entityLabels: ["favorites", "campaigns"],
    title: "List favorites",
    method: "GET",
    path: "/api/campaign/favorites",
    requiresAuth: true,
  },
  {
    id: "campaign-fav-add",
    domain: "Campaigns",
    entityLabels: ["favorites", "campaigns"],
    title: "Add favorite",
    method: "POST",
    path: "/api/campaign/favorites",
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CampaignFavoritePayload",
    fields: [{ key: "campaign_id", label: "campaign_id", type: "number", placeholder: "1" }],
  },
  {
    id: "campaign-fav-remove",
    domain: "Campaigns",
    entityLabels: ["favorites", "campaigns"],
    title: "Remove favorite",
    method: "DELETE",
    path: "/api/campaign/favorites",
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CampaignFavoritePayload",
    fields: [{ key: "campaign_id", label: "campaign_id", type: "number", placeholder: "1" }],
  },
  {
    id: "campaign-comments-list",
    domain: "Campaigns",
    entityLabels: ["comments", "campaigns"],
    title: "List campaign comments",
    method: "GET",
    path: "/api/campaign/{id}/comments",
    pathParams: { id: "1" },
  },
  {
    id: "campaign-comments-create",
    domain: "Campaigns",
    entityLabels: ["comments", "campaigns"],
    title: "Create comment",
    method: "POST",
    path: "/api/campaign/{id}/comments",
    pathParams: { id: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CampaignCommentCreatePayload",
    fields: [{ key: "text", label: "text", type: "textarea", placeholder: "Great initiative." }],
  },
  {
    id: "campaign-comments-delete",
    domain: "Campaigns",
    entityLabels: ["comments", "campaigns"],
    title: "Delete comment",
    method: "DELETE",
    path: "/api/campaign/{id}/comments",
    pathParams: { id: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CampaignCommentDeletePayload",
    fields: [{ key: "comment_id", label: "comment_id", type: "number", placeholder: "44" }],
  },
  {
    id: "campaign-comments-moderation",
    domain: "Campaigns",
    entityLabels: ["comments", "campaigns"],
    title: "Moderate comment",
    method: "POST",
    path: "/api/campaign/{id}/comments/{commentId}/moderation",
    pathParams: { id: "1", commentId: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CampaignCommentModerationPayload",
    fields: [{ key: "comment_approval", label: "comment_approval", type: "boolean", defaultValue: true }],
  },
  {
    id: "campaign-signature-list",
    domain: "Campaigns",
    entityLabels: ["signatures", "campaigns"],
    title: "Get campaign signatures",
    method: "GET",
    path: "/api/campaign/{id}/signature",
    pathParams: { id: "1" },
  },
  {
    id: "campaign-signature-add",
    domain: "Campaigns",
    entityLabels: ["signatures", "campaigns"],
    title: "Sign campaign",
    method: "POST",
    path: "/api/campaign/{id}/signature",
    pathParams: { id: "1" },
    requiresAuth: true,
  },
  {
    id: "campaign-signature-remove",
    domain: "Campaigns",
    entityLabels: ["signatures", "campaigns"],
    title: "Unsign campaign",
    method: "DELETE",
    path: "/api/campaign/{id}/signature",
    pathParams: { id: "1" },
    requiresAuth: true,
  },
  {
    id: "org-list",
    domain: "Organizations",
    entityLabels: ["organizations"],
    title: "List organizations",
    method: "GET",
    path: "/api/organization",
  },
  {
    id: "org-create",
    domain: "Organizations",
    entityLabels: ["organizations"],
    title: "Create organization",
    method: "POST",
    path: "/api/organization",
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CreateOrganizationPayload",
    fields: [
      { key: "name", label: "name", type: "text", placeholder: "Ocean Protectors" },
      { key: "description", label: "description", type: "textarea", optional: true },
      { key: "cover_path", label: "cover_path", type: "text", optional: true, placeholder: "/covers/ocean.png" },
      { key: "is_public", label: "is_public", type: "boolean", defaultValue: true },
      { key: "requires_approval", label: "requires_approval", type: "boolean", defaultValue: false },
    ],
  },
  {
    id: "org-get",
    domain: "Organizations",
    entityLabels: ["organizations"],
    title: "Get organization by id",
    method: "GET",
    path: "/api/organization/{id}",
    pathParams: { id: "1" },
  },
  {
    id: "org-post-id",
    domain: "Organizations",
    entityLabels: ["organizations"],
    title: "POST /organization/{id}",
    method: "POST",
    path: "/api/organization/{id}",
    pathParams: { id: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CreateOrganizationPayload",
    fields: [
      { key: "name", label: "name", type: "text", placeholder: "Ocean Protectors" },
      { key: "description", label: "description", type: "textarea", optional: true },
      { key: "cover_path", label: "cover_path", type: "text", optional: true, placeholder: "/covers/ocean.png" },
      { key: "is_public", label: "is_public", type: "boolean", defaultValue: true },
      { key: "requires_approval", label: "requires_approval", type: "boolean", defaultValue: false },
    ],
  },
  {
    id: "org-delete",
    domain: "Organizations",
    entityLabels: ["organizations"],
    title: "Delete organization",
    method: "DELETE",
    path: "/api/organization/{id}",
    pathParams: { id: "1" },
    requiresAuth: true,
  },
  {
    id: "org-join",
    domain: "Organizations",
    entityLabels: ["organizations", "members", "invite_codes", "approval_requests"],
    title: "Join organization",
    method: "POST",
    path: "/api/organization/join",
    supportsBody: true,
    requiresAuth: true,
    bodyType: "JoinOrganizationPayload",
    fields: [
      { key: "organization_id", label: "organization_id", type: "number", optional: true, placeholder: "1" },
      { key: "organizationId", label: "organizationId", type: "number", optional: true, placeholder: "1" },
      { key: "invite_code", label: "invite_code", type: "text", optional: true, placeholder: "ORG-AAA-111" },
    ],
  },
  {
    id: "org-members-count",
    domain: "Organizations",
    entityLabels: ["members", "organizations"],
    title: "Get members count",
    method: "GET",
    path: "/api/organization/{id}/member",
    pathParams: { id: "1" },
  },
  {
    id: "org-members-add",
    domain: "Organizations",
    entityLabels: ["members", "organizations"],
    title: "Add member",
    method: "POST",
    path: "/api/organization/{id}/member",
    pathParams: { id: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "AddMemberPayload",
    fields: [
      { key: "is_moderator", label: "is_moderator", type: "boolean", optional: true, defaultValue: false },
      { key: "is_owner", label: "is_owner", type: "boolean", optional: true, defaultValue: false },
    ],
  },
  {
    id: "org-members-delete",
    domain: "Organizations",
    entityLabels: ["members", "organizations"],
    title: "Remove member",
    method: "DELETE",
    path: "/api/organization/{id}/member",
    pathParams: { id: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "RemoveMemberPayload",
    fields: [{ key: "user_id", label: "user_id", type: "number", placeholder: "2" }],
  },
  {
    id: "org-invite-list",
    domain: "Organizations",
    entityLabels: ["invite_codes", "organizations"],
    title: "List invite codes",
    method: "GET",
    path: "/api/organization/{id}/invite_codes",
    pathParams: { id: "1" },
    requiresAuth: true,
  },
  {
    id: "org-invite-create",
    domain: "Organizations",
    entityLabels: ["invite_codes", "organizations"],
    title: "Create invite code",
    method: "POST",
    path: "/api/organization/{id}/invite_codes",
    pathParams: { id: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "CreateInviteCodePayload",
    fields: [
      { key: "uses", label: "uses", type: "number", defaultValue: 1 },
      { key: "expires_at", label: "expires_at", type: "date", optional: true },
    ],
  },
  {
    id: "org-invite-delete",
    domain: "Organizations",
    entityLabels: ["invite_codes", "organizations"],
    title: "Delete invite code",
    method: "DELETE",
    path: "/api/organization/{id}/invite_codes",
    pathParams: { id: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "DeleteInviteCodePayload",
    fields: [{ key: "code", label: "code", type: "text", placeholder: "ORG-AAA-111" }],
  },
  {
    id: "org-approval-list",
    domain: "Organizations",
    entityLabels: ["approval_requests", "organizations"],
    title: "List approval requests",
    method: "GET",
    path: "/api/organization/{id}/approval_requests",
    pathParams: { id: "1" },
    requiresAuth: true,
  },
  {
    id: "org-approval-post",
    domain: "Organizations",
    entityLabels: ["approval_requests", "organizations"],
    title: "Approve/deny request",
    method: "POST",
    path: "/api/organization/{id}/approval_requests",
    pathParams: { id: "1" },
    supportsBody: true,
    requiresAuth: true,
    bodyType: "ApprovalRequestPayload",
    fields: [
      { key: "user_id", label: "user_id", type: "number", optional: true, placeholder: "2" },
      { key: "userId", label: "userId", type: "number", optional: true, placeholder: "2" },
      { key: "userI_id", label: "userI_id", type: "number", optional: true, placeholder: "2" },
      { key: "approval", label: "approval", type: "boolean", defaultValue: true },
    ],
  },
  {
    id: "notif-list",
    domain: "Notifications",
    entityLabels: ["notifications"],
    title: "List notifications",
    method: "GET",
    path: "/api/notification",
    requiresAuth: true,
  },
  {
    id: "notif-post-action",
    domain: "Notifications",
    entityLabels: ["notifications"],
    title: "Read notification(s)",
    method: "POST",
    path: "/api/notification",
    supportsBody: true,
    requiresAuth: true,
    bodyType: "NotificationReadActionPayload",
    variants: [
      { id: "read-one", label: "read_notification", body: { action: "read_notification", notification_id: 1 } },
      { id: "read-all", label: "read_all", body: { action: "read_all" } },
    ],
    fields: [
      { key: "action", label: "action", type: "text", defaultValue: "read_notification" },
      { key: "notification_id", label: "notification_id", type: "number", optional: true, placeholder: "1" },
    ],
  },
  {
    id: "notif-delete-action",
    domain: "Notifications",
    entityLabels: ["notifications"],
    title: "Delete notification(s)",
    method: "DELETE",
    path: "/api/notification",
    supportsBody: true,
    requiresAuth: true,
    bodyType: "NotificationDeleteActionPayload",
    variants: [
      {
        id: "delete-one",
        label: "delete_notification",
        body: { action: "delete_notification", notification_id: 1 },
      },
      { id: "delete-all", label: "delete_all", body: { action: "delete_all" } },
    ],
    fields: [
      { key: "action", label: "action", type: "text", defaultValue: "delete_notification" },
      { key: "notification_id", label: "notification_id", type: "number", optional: true, placeholder: "1" },
    ],
  },
  {
    id: "notif-create",
    domain: "Notifications",
    entityLabels: ["notifications", "users", "organizations", "campaigns"],
    title: "Create notification",
    method: "POST",
    path: "/api/notification/create",
    supportsBody: true,
    requiresAuth: true,
    bodyType: "NotificationCreatePayload",
    variants: [
      {
        id: "notif-user",
        label: "type=user",
        body: { type: "user", target_user_id: 1, title: "Hello", text: "Direct message" },
      },
      {
        id: "notif-org",
        label: "type=organization",
        body: { type: "organization", organization_id: 1, title: "Org alert", text: "Organization update" },
      },
      {
        id: "notif-signers",
        label: "type=campaign_signers",
        body: { type: "campaign_signers", campaign_id: 1, title: "Campaign update", text: "Thanks for signing" },
      },
      {
        id: "notif-all",
        label: "type=all_users",
        body: { type: "all_users", title: "Global alert", text: "Hello everyone" },
      },
    ],
    fields: [
      { key: "type", label: "type", type: "text", defaultValue: "user" },
      { key: "target_user_id", label: "target_user_id", type: "number", optional: true, placeholder: "1" },
      { key: "organization_id", label: "organization_id", type: "number", optional: true, placeholder: "1" },
      { key: "campaign_id", label: "campaign_id", type: "number", optional: true, placeholder: "1" },
      { key: "title", label: "title", type: "text", placeholder: "Message title" },
      { key: "text", label: "text", type: "textarea", placeholder: "Message content" },
    ],
  },
];

const DOMAIN_LABELS: Record<Domain, string[]> = {
  Auth: ["users"],
  Campaigns: ["campaigns", "comments", "favorites", "signatures"],
  Organizations: ["organizations", "members", "invite_codes", "approval_requests"],
  Notifications: ["notifications"],
};

function formatMethodLabel(method: HttpMethod): string {
  return method;
}

function buildInitialCardState(endpoint: EndpointDefinition): CardState {
  const fieldDefaults: Record<string, unknown> = {};
  (endpoint.fields ?? []).forEach((field) => {
    if (typeof field.defaultValue !== "undefined") {
      fieldDefaults[field.key] = field.defaultValue;
    } else if (field.type === "boolean") {
      fieldDefaults[field.key] = false;
    } else {
      fieldDefaults[field.key] = "";
    }
  });

  const variant = endpoint.variants?.[0];
  const variantBody = variant?.body ?? {};
  const seeded = { ...fieldDefaults, ...variantBody };

  return {
    pathParams: { ...(endpoint.pathParams ?? {}) },
    bodyFields: seeded,
    useJsonEditor: false,
    jsonBody: endpoint.supportsBody ? JSON.stringify(seeded, null, 2) : "",
    selectedVariantId: variant?.id ?? "",
  };
}

function prunePayload(input: unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(prunePayload).filter((item) => typeof item !== "undefined");
  }

  if (input !== null && typeof input === "object") {
    const next: Record<string, unknown> = {};
    Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
      const pruned = prunePayload(value);
      if (typeof pruned === "undefined") {
        return;
      }
      next[key] = pruned;
    });
    return next;
  }

  if (input === "") {
    return undefined;
  }

  return input;
}

function safeParseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON";
    return { ok: false, error: message };
  }
}

function buildResolvedPath(templatePath: string, params: Record<string, string>): string {
  return templatePath.replace(/\{([^}]+)\}/g, (_, key: string) => {
    const value = params[key] ?? "";
    return encodeURIComponent(value);
  });
}

function makeAbsoluteUrl(baseUrl: string, resolvedPath: string): string {
  const cleanedBase = baseUrl.trim();
  if (!cleanedBase) {
    return resolvedPath;
  }

  const trimmed = cleanedBase.endsWith("/") ? cleanedBase.slice(0, -1) : cleanedBase;
  return `${trimmed}${resolvedPath}`;
}

function isAuthBodyType(
  bodyType: EndpointDefinition["bodyType"],
  payload: unknown,
):
  | SignupPayload
  | LoginPayload
  | CreateCampaignPayload
  | CampaignFavoritePayload
  | CampaignCommentCreatePayload
  | CampaignCommentDeletePayload
  | CampaignCommentModerationPayload
  | CreateOrganizationPayload
  | JoinOrganizationPayload
  | AddMemberPayload
  | RemoveMemberPayload
  | CreateInviteCodePayload
  | DeleteInviteCodePayload
  | ApprovalRequestPayload
  | NotificationReadActionPayload
  | NotificationDeleteActionPayload
  | NotificationCreatePayload
  | undefined {
  if (!bodyType) {
    return undefined;
  }
  return payload as
    | SignupPayload
    | LoginPayload
    | CreateCampaignPayload
    | CampaignFavoritePayload
    | CampaignCommentCreatePayload
    | CampaignCommentDeletePayload
    | CampaignCommentModerationPayload
    | CreateOrganizationPayload
    | JoinOrganizationPayload
    | AddMemberPayload
    | RemoveMemberPayload
    | CreateInviteCodePayload
    | DeleteInviteCodePayload
    | ApprovalRequestPayload
    | NotificationReadActionPayload
    | NotificationDeleteActionPayload
    | NotificationCreatePayload;
}

function humanDate(value: string): string {
  const dt = new Date(value);
  return `${dt.toLocaleDateString()} ${dt.toLocaleTimeString()}`;
}

export default function AdminControlPanelPage(): ReactElement {
  const [baseUrl, setBaseUrl] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [cookieMode, setCookieMode] = useState<boolean>(false);

  const [ready, setReady] = useState<boolean>(false);
  const [cards, setCards] = useState<Record<string, CardState>>({});
  const [runtime, setRuntime] = useState<Record<string, CardRuntime>>({});
  const [responses, setResponses] = useState<Record<string, ResponseView>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [tick, setTick] = useState<number>(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setTick(Date.now()), 100);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const nextCards: Record<string, CardState> = {};
    const nextRuntime: Record<string, CardRuntime> = {};

    ENDPOINTS.forEach((endpoint) => {
      nextCards[endpoint.id] = buildInitialCardState(endpoint);
      nextRuntime[endpoint.id] = { loading: false };
    });

    setCards(nextCards);
    setRuntime(nextRuntime);

    const storedBaseUrl = localStorage.getItem(STORAGE_KEYS.baseUrl) ?? "";
    const storedToken = localStorage.getItem(STORAGE_KEYS.token) ?? "";
    const storedCookieMode = localStorage.getItem(STORAGE_KEYS.cookieMode) === "1";

    setBaseUrl(storedBaseUrl);
    setSessionToken(storedToken);
    setCookieMode(storedCookieMode);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.baseUrl, baseUrl);
  }, [baseUrl, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.token, sessionToken);
  }, [sessionToken, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.cookieMode, cookieMode ? "1" : "0");
  }, [cookieMode, ready]);

  useEffect(() => {
    if (!ready || !cookieMode || !sessionToken.trim()) {
      return;
    }
    document.cookie = `session_token=${encodeURIComponent(sessionToken.trim())}; path=/; SameSite=Lax`;
  }, [cookieMode, sessionToken, ready]);

  const grouped = useMemo(() => {
    return ENDPOINTS.reduce<Record<Domain, EndpointDefinition[]>>(
      (acc, endpoint) => {
        acc[endpoint.domain].push(endpoint);
        return acc;
      },
      {
        Auth: [],
        Campaigns: [],
        Organizations: [],
        Notifications: [],
      },
    );
  }, []);

  const allLoading = useMemo(() => Object.values(runtime).some((item) => item.loading), [runtime]);

  const updateCard = (endpointId: string, updater: (prev: CardState) => CardState): void => {
    setCards((prev) => {
      const current = prev[endpointId];
      if (!current) {
        return prev;
      }
      return { ...prev, [endpointId]: updater(current) };
    });
  };

  const setCardError = (endpointId: string, message: string): void => {
    setErrors((prev) => ({ ...prev, [endpointId]: message }));
  };

  const clearCardError = (endpointId: string): void => {
    setErrors((prev) => {
      if (!prev[endpointId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[endpointId];
      return next;
    });
  };

  const updateRuntime = (endpointId: string, next: CardRuntime): void => {
    setRuntime((prev) => ({ ...prev, [endpointId]: next }));
  };

  const addLog = (entry: Omit<LogEntry, "id">): void => {
    setLogs((prev) => {
      const next: LogEntry[] = [{ ...entry, id: Date.now() + Math.floor(Math.random() * 1000) }, ...prev];
      return next.slice(0, LOG_LIMIT);
    });
  };

  const executeRequest = async (endpoint: EndpointDefinition): Promise<void> => {
    const state = cards[endpoint.id];
    if (!state) {
      return;
    }

    clearCardError(endpoint.id);

    const resolvedPath = buildResolvedPath(endpoint.path, state.pathParams);
    const url = makeAbsoluteUrl(baseUrl, resolvedPath);

    let bodyPayload: unknown;
    if (endpoint.supportsBody) {
      if (state.useJsonEditor) {
        if (state.jsonBody.trim()) {
          const parsed = safeParseJson(state.jsonBody);
          if (!parsed.ok) {
            setCardError(endpoint.id, `JSON parse error: ${parsed.error}`);
            return;
          }
          bodyPayload = parsed.value;
        } else {
          bodyPayload = undefined;
        }
      } else {
        bodyPayload = prunePayload(state.bodyFields);
      }
      bodyPayload = prunePayload(bodyPayload);
      if (typeof bodyPayload !== "undefined") {
        bodyPayload = isAuthBodyType(endpoint.bodyType, bodyPayload);
      }
    }

    const headers: Record<string, string> = {};
    const token = sessionToken.trim();

    if (endpoint.requiresAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const hasBody = endpoint.supportsBody && typeof bodyPayload !== "undefined";
    if (hasBody) {
      headers["Content-Type"] = "application/json";
    }

    updateRuntime(endpoint.id, { loading: true, startedAt: Date.now() });

    const started = performance.now();

    try {
      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        credentials: cookieMode ? "include" : "same-origin",
        body: hasBody ? JSON.stringify(bodyPayload) : undefined,
      });

      const ended = performance.now();
      const durationMs = Math.round(ended - started);

      const headerMap: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headerMap[key] = value;
      });

      const rawText = await response.text();
      let parsedBody: unknown = rawText;

      if (rawText) {
        try {
          parsedBody = JSON.parse(rawText) as unknown;
        } catch {
          parsedBody = rawText;
        }
      }

      const result: ResponseView = {
        ok: response.ok,
        status: response.status,
        durationMs,
        headers: headerMap,
        body: parsedBody,
        url,
        method: endpoint.method,
        receivedAt: new Date().toISOString(),
      };

      setResponses((prev) => ({ ...prev, [endpoint.id]: result }));

      addLog({
        endpointTitle: endpoint.title,
        method: endpoint.method,
        path: resolvedPath,
        status: response.status,
        durationMs,
        ok: response.ok,
        at: result.receivedAt,
      });
    } catch (error) {
      const ended = performance.now();
      const durationMs = Math.round(ended - started);
      const message = error instanceof Error ? error.message : "Network request failed";

      setCardError(endpoint.id, `Network/API error: ${message}`);

      const result: ResponseView = {
        ok: false,
        status: 0,
        durationMs,
        headers: {},
        body: { error: message },
        url,
        method: endpoint.method,
        receivedAt: new Date().toISOString(),
      };

      setResponses((prev) => ({ ...prev, [endpoint.id]: result }));

      addLog({
        endpointTitle: endpoint.title,
        method: endpoint.method,
        path: resolvedPath,
        status: 0,
        durationMs,
        ok: false,
        at: result.receivedAt,
      });
    } finally {
      updateRuntime(endpoint.id, { loading: false });
    }
  };

  const onPathParamChange = (endpointId: string, key: string, value: string): void => {
    updateCard(endpointId, (prev) => ({
      ...prev,
      pathParams: {
        ...prev.pathParams,
        [key]: value,
      },
    }));
  };

  const onFieldChange = (endpointId: string, field: FieldConfig, nextValue: string | boolean): void => {
    updateCard(endpointId, (prev) => {
      let cast: unknown = nextValue;

      if (field.type === "number") {
        cast = nextValue === "" ? "" : Number(nextValue);
      }

      if (field.type === "boolean") {
        cast = Boolean(nextValue);
      }

      const nextBodyFields = {
        ...prev.bodyFields,
        [field.key]: cast,
      };

      return {
        ...prev,
        bodyFields: nextBodyFields,
        jsonBody: prev.useJsonEditor ? prev.jsonBody : JSON.stringify(prunePayload(nextBodyFields), null, 2),
      };
    });
  };

  const onSelectVariant = (endpointId: string, endpoint: EndpointDefinition, variantId: string): void => {
    const variant = endpoint.variants?.find((item) => item.id === variantId);
    if (!variant) {
      return;
    }

    updateCard(endpointId, (prev) => {
      const merged = { ...prev.bodyFields, ...variant.body };
      return {
        ...prev,
        selectedVariantId: variantId,
        bodyFields: merged,
        jsonBody: JSON.stringify(prunePayload(merged), null, 2),
      };
    });
  };

  const onToggleJsonMode = (endpointId: string, enabled: boolean): void => {
    updateCard(endpointId, (prev) => ({
      ...prev,
      useJsonEditor: enabled,
      jsonBody: enabled ? JSON.stringify(prunePayload(prev.bodyFields), null, 2) : prev.jsonBody,
    }));
  };

  const onJsonEdit = (endpointId: string, value: string): void => {
    updateCard(endpointId, (prev) => ({ ...prev, jsonBody: value }));
  };

  const copyResponse = async (endpointId: string): Promise<void> => {
    const response = responses[endpointId];
    if (!response) {
      return;
    }

    const payload = JSON.stringify(response, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      setCardError(endpointId, "Copied response payload to clipboard.");
      window.setTimeout(() => clearCardError(endpointId), 1400);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Clipboard unavailable";
      setCardError(endpointId, `Copy failed: ${message}`);
    }
  };

  const clearLogs = (): void => {
    setLogs([]);
  };

  const clearSavedAuth = (): void => {
    setSessionToken("");
    localStorage.removeItem(STORAGE_KEYS.token);
    if (cookieMode) {
      document.cookie = "session_token=; Max-Age=0; path=/";
    }
  };

  if (!ready) {
    return (
      <main className="cp-page">
        <div className="cp-shell">
          <p className="cp-muted">Loading control panel...</p>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="cp-page">
      <div className="cp-shell">
        <header className="cp-header">
          <div>
            <h1>API Admin Control Panel</h1>
            <p className="cp-muted">
              Console test surface for all API routes. Includes auth token, cookie mode, request timeline, and rich
              response inspectors.
            </p>
          </div>
          <div className="cp-header-state">
            <span className={`cp-pill ${allLoading ? "run" : "idle"}`}>{allLoading ? "Traffic Active" : "Idle"}</span>
            <span className="cp-pill subtle">{ENDPOINTS.length} routes</span>
          </div>
        </header>

        <section className="cp-top-grid">
          <div className="cp-card">
            <h2>Global Connection</h2>
            <div className="cp-grid-two">
              <label className="cp-field">
                <span>Base URL (optional)</span>
                <input
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder="http://localhost:3000"
                  spellCheck={false}
                />
              </label>
              <label className="cp-field">
                <span>Session Token (JWT)</span>
                <input
                  value={sessionToken}
                  onChange={(event) => setSessionToken(event.target.value)}
                  placeholder="eyJhbGciOi..."
                  spellCheck={false}
                />
              </label>
            </div>
            <div className="cp-inline-actions">
              <label className="cp-check-row">
                <input
                  type="checkbox"
                  checked={cookieMode}
                  onChange={(event) => setCookieMode(event.target.checked)}
                />
                <span>Cookie mode (session_token + credentials include)</span>
              </label>
              <button type="button" className="cp-btn ghost" onClick={clearSavedAuth}>
                Clear auth
              </button>
              <button
                type="button"
                className="cp-btn"
                onClick={() => {
                  const endpoint = ENDPOINTS.find((item) => item.id === "auth-me");
                  if (endpoint) {
                    void executeRequest(endpoint);
                  }
                }}
              >
                Test auth /api/auth/me
              </button>
            </div>
          </div>

          <details className="cp-card" open>
            <summary>
              <strong>Request Log</strong>
              <span className="cp-summary-right">{logs.length} entries</span>
            </summary>
            <div className="cp-log-actions">
              <button type="button" className="cp-btn ghost" onClick={clearLogs}>
                Clear log
              </button>
            </div>
            <div className="cp-log-list">
              {logs.length === 0 ? (
                <div className="cp-muted">No requests yet.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className={`cp-log-item ${log.ok ? "ok" : "error"}`}>
                    <span className="method">{log.method}</span>
                    <span className="status">{log.status}</span>
                    <span className="path">{log.path}</span>
                    <span className="dur">{log.durationMs}ms</span>
                    <span className="time">{humanDate(log.at)}</span>
                  </div>
                ))
              )}
            </div>
          </details>
        </section>

        {(Object.keys(grouped) as Domain[]).map((domain) => {
          const endpoints = grouped[domain];
          return (
            <details key={domain} className="cp-domain" open>
              <summary>
                <div className="cp-domain-header">
                  <div>
                    <h2>{domain}</h2>
                    <div className="cp-label-row">
                      {DOMAIN_LABELS[domain].map((label) => (
                        <span key={`${domain}-${label}`} className="cp-entity-label">
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="cp-summary-right">{endpoints.length} endpoints</span>
                </div>
              </summary>

              <div className="cp-card-list">
                {endpoints.map((endpoint) => {
                  const state = cards[endpoint.id];
                  const cardRuntime = runtime[endpoint.id];
                  const response = responses[endpoint.id];
                  const cardError = errors[endpoint.id];
                  const elapsed = cardRuntime?.loading && cardRuntime.startedAt ? tick - cardRuntime.startedAt : 0;

                  return (
                    <details className="cp-endpoint" key={endpoint.id}>
                      <summary>
                        <div className="cp-endpoint-head">
                          <div className="cp-endpoint-id">
                            <span className={`cp-method method-${endpoint.method.toLowerCase()}`}>
                              {formatMethodLabel(endpoint.method)}
                            </span>
                            <strong>{endpoint.title}</strong>
                          </div>
                          <code className="cp-path">{endpoint.path}</code>
                        </div>
                      </summary>

                      <div className="cp-endpoint-content">
                        {endpoint.description ? <p className="cp-muted">{endpoint.description}</p> : null}

                        {Object.keys(state?.pathParams ?? {}).length > 0 ? (
                          <div className="cp-subsection">
                            <h4>Path Params</h4>
                            <div className="cp-grid-three">
                              {Object.entries(state.pathParams).map(([key, value]) => (
                                <label className="cp-field" key={`${endpoint.id}-path-${key}`}>
                                  <span>{key}</span>
                                  <input
                                    value={value}
                                    onChange={(event) => onPathParamChange(endpoint.id, key, event.target.value)}
                                    spellCheck={false}
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {endpoint.supportsBody ? (
                          <div className="cp-subsection">
                            <div className="cp-body-title-row">
                              <h4>Request Body</h4>
                              <label className="cp-check-row">
                                <input
                                  type="checkbox"
                                  checked={state?.useJsonEditor ?? false}
                                  onChange={(event) => onToggleJsonMode(endpoint.id, event.target.checked)}
                                />
                                <span>JSON editor mode</span>
                              </label>
                            </div>

                            {endpoint.variants && endpoint.variants.length > 0 ? (
                              <label className="cp-field">
                                <span>Body variant</span>
                                <select
                                  value={state?.selectedVariantId ?? ""}
                                  onChange={(event) => onSelectVariant(endpoint.id, endpoint, event.target.value)}
                                >
                                  {endpoint.variants.map((variant) => (
                                    <option key={variant.id} value={variant.id}>
                                      {variant.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : null}

                            {state?.useJsonEditor ? (
                              <label className="cp-field">
                                <span>Raw JSON</span>
                                <textarea
                                  rows={8}
                                  value={state.jsonBody}
                                  onChange={(event) => onJsonEdit(endpoint.id, event.target.value)}
                                  spellCheck={false}
                                />
                              </label>
                            ) : (
                              <div className="cp-grid-two">
                                {(endpoint.fields ?? []).map((field) => {
                                  const current = state?.bodyFields[field.key];
                                  const valueString = typeof current === "undefined" ? "" : String(current);

                                  if (field.type === "boolean") {
                                    return (
                                      <label className="cp-field cp-check-field" key={`${endpoint.id}-field-${field.key}`}>
                                        <span>{field.label}</span>
                                        <label className="cp-check-row">
                                          <input
                                            type="checkbox"
                                            checked={Boolean(current)}
                                            onChange={(event) =>
                                              onFieldChange(endpoint.id, field, event.target.checked)
                                            }
                                          />
                                          <span>{Boolean(current) ? "true" : "false"}</span>
                                        </label>
                                      </label>
                                    );
                                  }

                                  if (field.type === "textarea") {
                                    return (
                                      <label className="cp-field" key={`${endpoint.id}-field-${field.key}`}>
                                        <span>
                                          {field.label}
                                          {field.optional ? " (optional)" : ""}
                                        </span>
                                        <textarea
                                          rows={4}
                                          value={valueString}
                                          onChange={(event) => onFieldChange(endpoint.id, field, event.target.value)}
                                          placeholder={field.placeholder}
                                        />
                                      </label>
                                    );
                                  }

                                  return (
                                    <label className="cp-field" key={`${endpoint.id}-field-${field.key}`}>
                                      <span>
                                        {field.label}
                                        {field.optional ? " (optional)" : ""}
                                      </span>
                                      <input
                                        type={field.type === "password" ? "password" : field.type === "date" ? "date" : "text"}
                                        value={valueString}
                                        onChange={(event) => onFieldChange(endpoint.id, field, event.target.value)}
                                        placeholder={field.placeholder}
                                      />
                                    </label>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ) : null}

                        <div className="cp-inline-actions">
                          <button
                            type="button"
                            className="cp-btn"
                            disabled={Boolean(cardRuntime?.loading)}
                            onClick={() => {
                              void executeRequest(endpoint);
                            }}
                          >
                            {cardRuntime?.loading ? "Sending..." : "Send request"}
                          </button>
                          <span className="cp-muted">
                            {cardRuntime?.loading ? `Elapsed: ${elapsed}ms` : response ? `Last: ${response.durationMs}ms` : ""}
                          </span>
                          {endpoint.requiresAuth ? <span className="cp-auth-flag">Requires auth</span> : null}
                          {endpoint.bodyType ? <span className="cp-type-flag">{endpoint.bodyType}</span> : null}
                        </div>

                        {cardError ? <div className="cp-error">{cardError}</div> : null}

                        {response ? (
                          <div className="cp-response">
                            <div className="cp-response-head">
                              <span className={`cp-status ${response.ok ? "ok" : "error"}`}>HTTP {response.status}</span>
                              <span className="cp-muted">{response.durationMs}ms</span>
                              <span className="cp-muted">{response.method}</span>
                              <span className="cp-muted path">{response.url}</span>
                              <button
                                type="button"
                                className="cp-btn ghost"
                                onClick={() => {
                                  void copyResponse(endpoint.id);
                                }}
                              >
                                Copy response
                              </button>
                            </div>

                            <details open>
                              <summary>Headers</summary>
                              <pre>{JSON.stringify(response.headers, null, 2)}</pre>
                            </details>

                            <details open>
                              <summary>Body</summary>
                              <pre>{JSON.stringify(response.body, null, 2)}</pre>
                            </details>
                          </div>
                        ) : null}
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .cp-page {
    min-height: 100vh;
    background: radial-gradient(circle at 20% 0%, #1b2a44 0%, #0b0f19 45%, #070910 100%);
    color: #d8e3f6;
    padding: 1.2rem;
  }

  .cp-shell {
    width: min(1400px, 100%);
    margin: 0 auto;
    display: grid;
    gap: 1rem;
  }

  .cp-header {
    border: 1px solid #2d3859;
    background: linear-gradient(180deg, rgba(21, 31, 52, 0.95), rgba(13, 20, 33, 0.95));
    border-radius: 14px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: flex-start;
    box-shadow: inset 0 0 0 1px rgba(75, 115, 180, 0.2), 0 8px 30px rgba(0, 0, 0, 0.35);
  }

  h1,
  h2,
  h3,
  h4 {
    margin: 0;
  }

  .cp-muted {
    color: #90a1c2;
    margin: 0.2rem 0;
    font-size: 0.92rem;
  }

  .cp-header-state {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .cp-pill {
    border: 1px solid #35507f;
    border-radius: 999px;
    padding: 0.24rem 0.6rem;
    font-size: 0.77rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #9ec5ff;
    background: rgba(26, 42, 71, 0.65);
  }

  .cp-pill.run {
    border-color: #2ce0aa;
    color: #2ce0aa;
    box-shadow: 0 0 18px rgba(44, 224, 170, 0.3);
  }

  .cp-pill.subtle,
  .cp-pill.idle {
    color: #a2b6d8;
  }

  .cp-top-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 2fr 1fr;
  }

  .cp-card,
  .cp-domain,
  .cp-endpoint {
    border: 1px solid #28344f;
    background: linear-gradient(180deg, rgba(16, 24, 40, 0.96), rgba(9, 14, 24, 0.96));
    border-radius: 12px;
    padding: 0.8rem;
  }

  summary {
    cursor: pointer;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  .cp-summary-right {
    margin-left: auto;
    color: #8ea9d5;
    font-size: 0.85rem;
  }

  .cp-grid-two {
    display: grid;
    gap: 0.7rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cp-grid-three {
    display: grid;
    gap: 0.7rem;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cp-field {
    display: grid;
    gap: 0.35rem;
  }

  .cp-field > span {
    font-size: 0.82rem;
    color: #97b0db;
  }

  input,
  select,
  textarea {
    background: #0e1626;
    border: 1px solid #304363;
    color: #d8e3f6;
    border-radius: 8px;
    padding: 0.52rem 0.65rem;
    font: inherit;
    width: 100%;
  }

  textarea {
    resize: vertical;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: #5aa3ff;
    box-shadow: 0 0 0 2px rgba(90, 163, 255, 0.18);
  }

  .cp-inline-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-top: 0.7rem;
  }

  .cp-btn {
    appearance: none;
    border: 1px solid #3c72c4;
    background: linear-gradient(180deg, #2358a7, #1a4a91);
    color: #eaf2ff;
    border-radius: 8px;
    padding: 0.45rem 0.7rem;
    font-weight: 600;
    cursor: pointer;
  }

  .cp-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cp-btn.ghost {
    background: transparent;
    border-color: #3c4d6e;
    color: #a9bbdb;
  }

  .cp-check-row {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #adc3e8;
  }

  .cp-check-row input {
    width: auto;
  }

  .cp-log-actions {
    margin: 0.6rem 0;
    display: flex;
    justify-content: flex-end;
  }

  .cp-log-list {
    display: grid;
    gap: 0.4rem;
    max-height: 340px;
    overflow: auto;
  }

  .cp-log-item {
    border: 1px solid #2f3a57;
    border-left-width: 4px;
    border-radius: 8px;
    padding: 0.38rem 0.5rem;
    font-size: 0.82rem;
    display: grid;
    gap: 0.5rem;
    grid-template-columns: 54px 45px minmax(160px, 1fr) 62px 160px;
    align-items: center;
  }

  .cp-log-item.ok {
    border-left-color: #20c997;
  }

  .cp-log-item.error {
    border-left-color: #ff6179;
  }

  .cp-log-item .path {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #d3def4;
  }

  .cp-domain-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.2rem;
  }

  .cp-label-row {
    margin-top: 0.35rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .cp-entity-label {
    border: 1px solid #394967;
    border-radius: 999px;
    color: #95b7eb;
    font-size: 0.72rem;
    padding: 0.18rem 0.48rem;
  }

  .cp-card-list {
    display: grid;
    gap: 0.8rem;
    margin-top: 0.6rem;
  }

  .cp-endpoint {
    background: rgba(13, 21, 35, 0.75);
  }

  .cp-endpoint-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .cp-endpoint-id {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .cp-method {
    border-radius: 999px;
    padding: 0.13rem 0.5rem;
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    border: 1px solid transparent;
  }

  .method-get {
    color: #9df7ce;
    background: rgba(35, 119, 87, 0.25);
    border-color: rgba(107, 221, 176, 0.4);
  }

  .method-post {
    color: #9ac5ff;
    background: rgba(44, 92, 165, 0.3);
    border-color: rgba(92, 158, 255, 0.45);
  }

  .method-delete {
    color: #ffb2be;
    background: rgba(163, 43, 74, 0.25);
    border-color: rgba(255, 110, 139, 0.45);
  }

  .cp-path {
    color: #8da9d8;
    font-size: 0.86rem;
    background: #0a111f;
    border: 1px solid #2d3f60;
    padding: 0.26rem 0.45rem;
    border-radius: 7px;
  }

  .cp-endpoint-content {
    display: grid;
    gap: 0.8rem;
    margin-top: 0.8rem;
  }

  .cp-subsection {
    border: 1px solid #27334f;
    border-radius: 8px;
    padding: 0.65rem;
    background: rgba(10, 16, 28, 0.7);
    display: grid;
    gap: 0.6rem;
  }

  .cp-body-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .cp-error {
    border: 1px solid rgba(255, 116, 139, 0.45);
    color: #ffd3db;
    background: rgba(161, 35, 60, 0.25);
    border-radius: 8px;
    padding: 0.45rem 0.6rem;
    font-size: 0.87rem;
  }

  .cp-auth-flag,
  .cp-type-flag {
    border: 1px solid #37496e;
    border-radius: 999px;
    font-size: 0.73rem;
    color: #9bb9e8;
    padding: 0.16rem 0.45rem;
    background: rgba(35, 52, 82, 0.5);
  }

  .cp-response {
    border: 1px solid #2a395a;
    border-radius: 8px;
    padding: 0.62rem;
    background: rgba(8, 14, 23, 0.72);
    display: grid;
    gap: 0.5rem;
  }

  .cp-response-head {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .cp-status {
    border: 1px solid;
    border-radius: 999px;
    font-size: 0.74rem;
    padding: 0.14rem 0.47rem;
    font-weight: 700;
  }

  .cp-status.ok {
    border-color: rgba(75, 214, 163, 0.6);
    color: #98f0cb;
  }

  .cp-status.error {
    border-color: rgba(255, 110, 139, 0.6);
    color: #ffc0cc;
  }

  .cp-response .path {
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    padding: 0.6rem;
    border-radius: 8px;
    background: #090f1b;
    border: 1px solid #263754;
    color: #b8cef6;
    font-size: 0.78rem;
    max-height: 380px;
    overflow: auto;
  }

  @media (max-width: 1100px) {
    .cp-top-grid {
      grid-template-columns: 1fr;
    }

    .cp-grid-three {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 760px) {
    .cp-page {
      padding: 0.7rem;
    }

    .cp-grid-two,
    .cp-grid-three {
      grid-template-columns: 1fr;
    }

    .cp-log-item {
      grid-template-columns: 44px 40px minmax(100px, 1fr);
      grid-auto-rows: auto;
    }

    .cp-log-item .dur,
    .cp-log-item .time {
      grid-column: 2 / span 2;
    }
  }
`;
