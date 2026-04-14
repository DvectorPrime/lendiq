import express from 'express';
import { login, logout, me, register } from '../controllers/authController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', verifyJWT, logout);
authRouter.get('/me', verifyJWT, me);

export default authRouter;