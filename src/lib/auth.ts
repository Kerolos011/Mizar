export const ADMIN_SESSION_COOKIE_NAME = "mizar-admin-session";
export const ADMIN_SESSION_COOKIE_VALUE = "authenticated";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function getSafeRedirectPath(value?: string | null) {
  if (!value) return "/dashboard";

  if (!value.startsWith("/dashboard")) {
    return "/dashboard";
  }

  if (value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}