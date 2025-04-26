import {Router} from 'express';
import {gatewayController} from './gateway.controller';
import { authService } from '../middleware/authentication';
import { PERMISSION_RESOURCES, PRIMARY_PERMISSIONS } from '../config/constants/permissions';
import { requestValidator } from '../middleware/validator';
import { productSchema } from '../user/models/base';

const router = Router();

router.use(authService.checkTenant, authService.authenticate);

// Product service routes
router.get(
    '/products', 
    authService.authorize(PERMISSION_RESOURCES.PRODUCTS, PRIMARY_PERMISSIONS.READ), 
    gatewayController.routeProductService
);

router.get(
    '/products/:id', 
    authService.authorize(PERMISSION_RESOURCES.PRODUCTS, PRIMARY_PERMISSIONS.READ), 
    gatewayController.routeProductService
);

router.post(
    '/products', 
    requestValidator.validateBody(productSchema),
    authService.authorize(PERMISSION_RESOURCES.PRODUCTS, PRIMARY_PERMISSIONS.CREATE), 
    gatewayController.routeProductService
);

router.patch(
    '/products"id', 
    authService.authorize(PERMISSION_RESOURCES.PRODUCTS, PRIMARY_PERMISSIONS.UPDATE), 
    gatewayController.routeProductService
);


// User service routes
router.get(
    '/users',
    authService.authorize(PERMISSION_RESOURCES.USERS, PRIMARY_PERMISSIONS.READ), 
    gatewayController.routeUserService
)

export default router;