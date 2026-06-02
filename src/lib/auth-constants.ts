/**
 * Edge-safe auth constants (no server-only / Prisma imports), so they can
 * be used from middleware as well as server modules.
 */
export const SESSION_COOKIE = "velarapay_session";

/**
 * Holds the org id a superadmin is currently "viewing as" (impersonating).
 * Only honoured server-side when the real session user is a superadmin.
 */
export const IMPERSONATE_COOKIE = "velara_view_as";
