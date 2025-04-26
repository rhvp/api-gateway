import { Router } from 'express';
import { userController } from './user.controller';
import { loginSchema, oauthSchema, signupSchema } from './models/base';
import { requestValidator } from '../middleware/validator';
import { authService } from '../middleware/authentication';

const router = Router();

router.use(authService.checkTenant);

router.post('/signup', requestValidator.validateBody(signupSchema), userController.signup);
router.post('/login', requestValidator.validateBody(loginSchema), userController.login);
router.get('/google', requestValidator.validateQuery(oauthSchema), userController.oathLogin);

export default router;