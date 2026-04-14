import { type NextFunction, type Request, type Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

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
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ success: false, message: 'Authentication token has expired' });
    }

    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ success: false, message: 'Authentication token is invalid' });
    }

    if (error instanceof AuthServiceError) {
      if (error.statusCode >= 500) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      return res.status(401).json({ success: false, message: error.message });
    }

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