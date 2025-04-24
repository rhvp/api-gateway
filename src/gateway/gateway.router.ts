import {Router} from 'express';
import {gatewayController} from './gateway.controller';
import { authService } from '../middleware/authentication';

const router = Router();

router.use(authService.checkTenant, authService.authenticate);

// Product service routes
router.get('/products', gatewayController.routeProductService);
router.get('/products/:id', gatewayController.routeProductService);

export default router;