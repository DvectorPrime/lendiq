/**
 * Auth routes for user registration, login, logout, and profile retrieval.
 * POST /register - Register a new user
 * POST /login - Authenticate user and receive JWT token
 * POST /logout - Revoke JWT token (requires authentication)
 * GET /me - Fetch authenticated user profile (requires authentication)
 */

import express from 'express';
import { login, logout, me, register } from '../controllers/authController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', verifyJWT, logout);
authRouter.get('/me', verifyJWT, me);

export default authRouter;