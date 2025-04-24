import {Router} from 'express';
import gatewayRouter from './gateway/gateway.router';
import userRouter from './user/user.router';

const router = Router();

router.use("/api/services", gatewayRouter);
router.use("/api/auth", userRouter)

export default router;