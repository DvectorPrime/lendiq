/**
 * Auth middleware for verifying JWT tokens and protecting routes.
 * Extracts JWT from Authorization header (Bearer token) or auth_token cookie.
 * Validates token signature, checks blacklist status, and attaches user profile to req.user.
 * Also provides a requireAdmin middleware for role-based access control (planned/partial).
 */

import { type NextFunction, type Request, type Response } from 'express';

import {
  AUTH_COOKIE_NAME,
  AuthServiceError,
  findUserProfileById,
  getRequestToken,
  isTokenBlacklisted,
  type UserProfile,
  verifyAuthToken,
} from '../services/authService.js';

type AuthenticatedRequest = Request & {
  user?: UserProfile;
  token?: string;
};

function isErrorWithName(error: unknown, name: string): boolean {
  return error instanceof Error && error.name === name;
}

export async function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const token = getRequestToken(req.get('authorization') ?? undefined, req.cookies?.[AUTH_COOKIE_NAME]);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token is required' });
  }

  try {
    const payload = verifyAuthToken(token);
    const tokenIsBlacklisted = await isTokenBlacklisted(payload.jti);

    if (tokenIsBlacklisted) {
      return res.status(401).json({ success: false, message: 'Authentication token has been revoked' });
    }

    const user = await findUserProfileById(payload.sub);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication token is invalid' });
    }

    const authenticatedReq = req as AuthenticatedRequest;

    authenticatedReq.user = {
      ...user,
      role: user.role.toLowerCase(),
    };
    authenticatedReq.token = token;

    return next();
  } catch (error) {
    if (isErrorWithName(error, 'TokenExpiredError')) {
      return res.status(401).json({ success: false, message: 'Authentication token has expired' });
    }

    if (isErrorWithName(error, 'JsonWebTokenError')) {
      return res.status(401).json({ success: false, message: 'Authentication token is invalid' });
    }

    if (error instanceof AuthServiceError) {
      const clientMessage = (error as AuthServiceError).clientMessage ?? (error.statusCode >= 500 ? 'Internal server error' : error.message);
      // eslint-disable-next-line no-console
      console.error('[AuthMiddleware][verifyJWT] Internal error:', error);

      if (error.statusCode >= 500) {
        return res.status(error.statusCode).json({ success: false, message: clientMessage });
      }

      return res.status(401).json({ success: false, message: clientMessage });
    }

    // eslint-disable-next-line no-console
    console.error('[AuthMiddleware][verifyJWT] Unexpected error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify authentication token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authenticatedReq = req as AuthenticatedRequest;

  if (!authenticatedReq.user) {
    return res.status(401).json({ success: false, message: 'Authentication is required' });
  }

  if (authenticatedReq.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access is required' });
  }

  return next();
}