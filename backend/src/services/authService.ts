/**
 * Auth service containing core authentication business logic.
 * Handles user registration, login with JWT token generation, password hashing with bcryptjs,
 * token verification, and token blacklisting for logout functionality.
 * Manages JWT token creation/verification with jti (unique ID) for revocation support.
 */

import bcrypt from 'bcryptjs';
import type { CookieOptions } from 'express';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

import { prisma } from './prisma.js';

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export type AuthenticatedTokenPayload = JwtPayload & {
  sub: string;
  jti: string;
  exp: number;
};

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

class AuthServiceError extends Error {
  statusCode: number;
  // Optional client-safe message that can be returned to callers/users.
  clientMessage?: string;

  constructor(message: string, statusCode: number, clientMessage?: string) {
    super(message);
    this.name = 'AuthServiceError';
    this.statusCode = statusCode;
    if (clientMessage) this.clientMessage = clientMessage;
  }
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = 10;
export const AUTH_COOKIE_NAME = 'auth_token';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    // Do not expose internal configuration details to clients. Provide a safe client message.
    throw new AuthServiceError(
      'JWT secret is not configured (set JWT_SECRET in backend/.env and restart the server)',
      500,
      'Internal server error'
    );
  }

  return secret;
}

function isAuthenticatedTokenPayload(payload: string | JwtPayload): payload is AuthenticatedTokenPayload {
  return (
    typeof payload !== 'string' &&
    typeof payload.sub === 'string' &&
    typeof payload.jti === 'string' &&
    typeof payload.exp === 'number'
  );
}

export function verifyAuthToken(token: string): AuthenticatedTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret());

  if (!isAuthenticatedTokenPayload(decoded)) {
    throw new AuthServiceError('Token is invalid or malformed', 401);
  }

  return decoded;
}

function toUserProfile(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}): UserProfile {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.toLowerCase(),
  };
}

export function getAuthCookieOptions(token?: string): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const options: CookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
  };

  if (token) {
    const decoded = jwt.decode(token);

    if (decoded && typeof decoded === 'object' && typeof decoded.exp === 'number') {
      options.expires = new Date(decoded.exp * 1000);
    }
  }

  return options;
}

export function extractTokenFromAuthorizationHeader(authorizationHeader?: string): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

export function getRequestToken(authorizationHeader?: string, cookieToken?: string): string | null {
  return extractTokenFromAuthorizationHeader(authorizationHeader) ?? cookieToken ?? null;
}

export async function blacklistToken(token: string) {
  const payload = verifyAuthToken(token);

  await prisma.tokenBlacklist.upsert({
    where: { jti: payload.jti },
    create: {
      jti: payload.jti,
      userId: payload.sub,
      expiry: new Date(payload.exp * 1000),
    },
    update: {
      userId: payload.sub,
      expiry: new Date(payload.exp * 1000),
    },
  });

  return payload;
}

export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const blacklistedToken = await prisma.tokenBlacklist.findUnique({
    where: { jti },
    select: { id: true },
  });

  return Boolean(blacklistedToken);
}

export async function findUserProfileById(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return toUserProfile(user);
}

export async function getAuthenticatedUser(token: string) {
  const payload = verifyAuthToken(token);

  const blacklistedToken = await isTokenBlacklisted(payload.jti);

  if (blacklistedToken) {
    throw new AuthServiceError('Token has been revoked', 401);
  }

  const user = await findUserProfileById(payload.sub);

  if (!user) {
    throw new AuthServiceError('User not found', 404);
  }

  return user;
}

export async function registerUser(payload: RegisterPayload) {
  const email = payload.email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AuthServiceError('User already exists', 409);
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email,
      passwordHash,
    },
  });

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}

export async function authenticateUser(payload: LoginPayload) {
  const email = payload.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthServiceError('Invalid email or password', 401);
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AuthServiceError('Invalid email or password', 401);
  }

  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
    jwtid: randomUUID(),
  };

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    signOptions
  );

  return {
    token,
    user: toUserProfile(user),
  };
}

export { AuthServiceError };
