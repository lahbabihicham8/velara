import "server-only";
import { cookies } from "next/headers";
import { IMPERSONATE_COOKIE } from "@/lib/auth-constants";
import type { SessionUser } from "@/types";

/**
 * Resolve the organisation id whose data the current request operates on.
 *
 * For a normal user this is always their own org. For a platform superadmin
 * who is "viewing as" a client, it is the impersonated org id carried in the
 * view-as cookie. The cookie is only ever honoured for superadmins, so a
 * forged cookie on a normal account is inert.
 */
export async function activeOrgId(user: SessionUser): Promise<string> {
  if (!user.isSuperadmin) return user.orgId;
  const store = await cookies();
  const target = store.get(IMPERSONATE_COOKIE)?.value;
  return target && target.length > 0 ? target : user.orgId;
}

/**
 * The org id a superadmin is currently impersonating (distinct from their
 * own), or null. Drives the "viewing as" banner.
 */
export async function impersonatedOrgId(
  user: SessionUser,
): Promise<string | null> {
  if (!user.isSuperadmin) return null;
  const store = await cookies();
  const target = store.get(IMPERSONATE_COOKIE)?.value;
  return target && target !== user.orgId ? target : null;
}
