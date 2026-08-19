export const ADMIN_AUDIT_ACTIONS = [
  "auth.login",
  "auth.logout",
  "settings.update",
  "settings.update_failed",
  "logo.replace",
  "logo.remove",
] as const;

export const ADMIN_AUDIT_OUTCOMES = ["success", "failure", "denied"] as const;
