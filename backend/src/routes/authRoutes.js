import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';

const router = Router();

router.post('/signup', AuthController.signup);
router.post('/register', AuthController.signup); // Alias
router.post('/login', AuthController.login);
router.get('/me', AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
