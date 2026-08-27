import { ApiError } from "../utils/ApiError.js";

/**
 * Requires the authenticated user to have ALL of the given permissions.
 * Super Admins bypass all permission checks by design.
 */
export function requirePermissions(...permissions) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.isSuperAdmin) return next();

    const userPermissions = new Set(req.user.permissions || []);
    const hasAll = permissions.every((p) => userPermissions.has(p));
    if (!hasAll) {
      return next(ApiError.forbidden(`Missing required permission(s): ${permissions.join(", ")}`));
    }
    next();
  };
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.isSuperAdmin) return next();
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires one of roles: ${roles.join(", ")}`));
    }
    next();
  };
}
