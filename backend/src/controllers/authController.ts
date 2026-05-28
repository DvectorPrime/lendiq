/**
 * Auth controller handling HTTP request/response for authentication endpoints.
 * Validates request payloads (register, login) and delegates business logic to authService.
 * Handles error responses and sets authentication cookies on successful login/register.
 */

import { Request, Response } from 'express';

import {
  authenticateUser,
  AUTH_COOKIE_NAME,
  AuthServiceError,
  blacklistToken,
  getAuthCookieOptions,
  registerUser,
  type UserProfile,
} from '../services/authService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_REGEX = /^[\p{L}][\p{L}\p{M}'\-\s.]{0,58}[\p{L}\p{M}]$/u;

type RegisterBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginBody = {
  email: string;
  password: string;
};

type ValidationResult<T> =
  | { success: true; value: T }
  | { success: false; message: string };

type AuthenticatedRequest = Request & {
  user?: UserProfile;
  token?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyAllowedFields(body: Record<string, unknown>, allowedFields: string[]): boolean {
  return Object.keys(body).every((key) => allowedFields.includes(key));
}

function isValidLength(value: string, minLength: number, maxLength: number): boolean {
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
}

function validateRegisterBody(body: unknown): ValidationResult<RegisterBody> {
  if (!isObject(body)) {
    return { success: false, message: 'Request body must be a JSON object' };
  }

  const allowedFields = ['firstName', 'lastName', 'email', 'password'];

  if (!hasOnlyAllowedFields(body, allowedFields)) {
    return { success: false, message: 'Request body contains unsupported fields' };
  }

  const { firstName, lastName, email, password } = body;

  if (
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return { success: false, message: 'All fields must be strings' };
  }

  if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
    return { success: false, message: 'firstName, lastName, email and password are required' };
  }

  if (!isValidLength(firstName, 2, 60) || !isValidLength(lastName, 2, 60)) {
    return { success: false, message: 'firstName and lastName must be between 2 and 60 characters long' };
  }

  if (!NAME_REGEX.test(firstName.trim()) || !NAME_REGEX.test(lastName.trim())) {
    return { success: false, message: 'firstName and lastName contain invalid characters' };
  }

  if (email.trim().length > 254) {
    return { success: false, message: 'Email address is too long' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { success: false, message: 'Email format is invalid' };
  }

  if (password.length < 8 || password.length > 128) {
    return { success: false, message: 'Password must be between 8 and 128 characters long' };
  }

  return {
    success: true,
    value: {
      firstName,
      lastName,
      email,
      password,
    },
  };
}

function validateLoginBody(body: unknown): ValidationResult<LoginBody> {
  if (!isObject(body)) {
    return { success: false, message: 'Request body must be a JSON object' };
  }

  const allowedFields = ['email', 'password'];

  if (!hasOnlyAllowedFields(body, allowedFields)) {
    return { success: false, message: 'Request body contains unsupported fields' };
  }

  const { email, password } = body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { success: false, message: 'email and password must be strings' };
  }

  if (!email.trim() || !password) {
    return { success: false, message: 'email and password are required' };
  }

  if (email.trim().length > 254) {
    return { success: false, message: 'Email address is too long' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { success: false, message: 'Email format is invalid' };
  }

  if (password.length < 8 || password.length > 128) {
    return { success: false, message: 'Password must be between 8 and 128 characters long' };
  }

  return {
    success: true,
    value: {
      email,
      password,
    },
  };
}

export async function register(req: Request, res: Response) {
  const validation = validateRegisterBody(req.body);

  if (!validation.success) {
    return res.status(400).json({ success: false, message: validation.message });
  }

  try {
    const user = await registerUser(validation.value);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      const clientMessage = (error as AuthServiceError).clientMessage ?? (error.statusCode >= 500 ? 'Internal server error' : error.message);
      // Log internal error details for diagnostics
      // eslint-disable-next-line no-console
      console.error('[AuthController][register] Internal error:', error);
      return res.status(error.statusCode).json({ success: false, message: clientMessage });
    }

    // eslint-disable-next-line no-console
    console.error('[AuthController][register] Unexpected error:', error);
    return res.status(500).json({ success: false, message: 'Failed to register user' });
  }
}

export async function login(req: Request, res: Response) {
  const validation = validateLoginBody(req.body);

  if (!validation.success) {
    return res.status(400).json({ success: false, message: validation.message });
  }

  try {
    const result = await authenticateUser(validation.value);

    res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions(result.token));

    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      const clientMessage = (error as AuthServiceError).clientMessage ?? (error.statusCode >= 500 ? 'Internal server error' : error.message);
      // eslint-disable-next-line no-console
      console.error('[AuthController][login] Internal error:', error);
      return res.status(error.statusCode).json({ success: false, message: clientMessage });
    }

    // eslint-disable-next-line no-console
    console.error('[AuthController][login] Unexpected error:', error);
    return res.status(500).json({ success: false, message: 'Failed to authenticate user' });
  }
}

export async function logout(req: Request, res: Response) {
  const token = (req as AuthenticatedRequest).token;

  if (!token) {
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
    return res.status(401).json({ success: false, message: 'Authentication token is required' });
  }

  try {
    await blacklistToken(token);

    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions(token));

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: null,
    });
  } catch (error) {
    res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions(token));

    if (error instanceof AuthServiceError) {
      const clientMessage = (error as AuthServiceError).clientMessage ?? (error.statusCode >= 500 ? 'Internal server error' : error.message);
      // eslint-disable-next-line no-console
      console.error('[AuthController][logout] Internal error:', error);
      return res.status(error.statusCode).json({ success: false, message: clientMessage });
    }

    // eslint-disable-next-line no-console
    console.error('[AuthController][logout] Unexpected error:', error);
    return res.status(500).json({ success: false, message: 'Failed to log out user' });
  }
}

export async function me(req: Request, res: Response) {
  const user = (req as AuthenticatedRequest).user;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Authentication token is required' });
  }

  return res.status(200).json({
    success: true,
    message: 'Authenticated user retrieved successfully',
    data: user,
  });
}
