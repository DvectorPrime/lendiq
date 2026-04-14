import { Request, Response } from 'express';

import { authenticateUser, AuthServiceError, registerUser } from '../services/authService.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOnlyAllowedFields(body: Record<string, unknown>, allowedFields: string[]): boolean {
  return Object.keys(body).every((key) => allowedFields.includes(key));
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

  if (!EMAIL_REGEX.test(email.trim())) {
    return { success: false, message: 'Email format is invalid' };
  }

  if (password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters long' };
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

  if (!EMAIL_REGEX.test(email.trim())) {
    return { success: false, message: 'Email format is invalid' };
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
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

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

    return res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: 'Failed to authenticate user' });
  }
}
