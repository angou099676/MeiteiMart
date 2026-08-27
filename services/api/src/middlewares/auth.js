import { verifyAccessToken } from "../services/tokenService.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../modules/users/user.model.js";

/**
 * Verifies the access token and attaches `req.user` (lean, includes role name + permissions).
 * Permissions are read straight from the JWT payload (populated at login) to avoid a DB
 * round-trip on every request; sensitive/role-changing actions should re-fetch fresh data.
 */
export function requireAuth() {
  return async (req, res, next) => {
    try {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.accessToken;
      if (!token) throw ApiError.unauthorized("Missing access token");

      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub).select("-__v").lean();
      if (!user?.isActive) throw ApiError.unauthorized("Account is inactive or not found");

      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: payload.role,
        permissions: payload.permissions || [],
        isSuperAdmin: user.isSuperAdmin,
        sellerProfile: user.sellerProfile,
        deliveryProfile: user.deliveryProfile,
      };
      next();
    } catch (err) {
      next(ApiError.unauthorized(err.message || "Invalid or expired token"));
    }
  };
}
