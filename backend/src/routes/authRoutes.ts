import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/authController.js';
import { validateRequest, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../middleware/validate.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

export default router;
