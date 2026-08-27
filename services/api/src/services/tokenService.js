import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.accessExpiry });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiry });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.secret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

export function issueAuthTokens(user) {
  const payload = {
    sub: user._id.toString(),
    role: user.role?.name || user.role,
    permissions: user.permissions || [],
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken({ sub: payload.sub }),
  };
}
