import { NextFunction, Request, Response } from "express";
import { ForbiddenException, NotFoundException, UnauthorizedException } from "../shared/error/builder";
import { jwtService } from "../shared/jwt";
import { Logger } from "../shared/logger";
import { User } from "../user/models/base";
import UserModel from "../user/models/user";
import TenantModel from "../user/models/tenant";


declare global {
    namespace Express {
        interface Request {
            user: User;
            tenantId: string
        }
    }
}


class AuthService {
    private readonly logger = new Logger(AuthService.name);

    authenticate = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedException('Authentication token required');
            }

            const token = authHeader.split(' ')[1];
            const decodedToken = jwtService.decodeToken(token);

            if (!decodedToken) throw new UnauthorizedException('Invalid or expired token');

            if(decodedToken.tenantId !== req.tenantId) throw new ForbiddenException("Invalid tenant user");

            const user = await UserModel.findOne({ where: { id: decodedToken.userId} });

            if (!user) throw new NotFoundException("Invalid user");

            req.user = user;

            next();
        } catch (error) {
            next(error);
        }
    }


    checkTenant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantApiKey = req.headers['x-tenant-key'] as string;
    
            if (!tenantApiKey) throw new UnauthorizedException('Tenant key is required');
            
            const tenant = await TenantModel.findOne({ where: { key: tenantApiKey } });
            
            if (!tenant) throw new UnauthorizedException('Invalid tenant key');
            
            req.tenantId = tenant.id;

            next();
        } catch (error) {
            next(error);
        }
    }
}

export const authService = new AuthService();