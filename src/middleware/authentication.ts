import { NextFunction, Request, Response } from "express";
import { ForbiddenException, NotFoundException, UnauthorizedException } from "../shared/error/builder";
import { jwtService } from "../shared/jwt";
import { RolePermission, User } from "../user/models/base";
import UserRepository from "../user/models/user";
import TenantRepository from "../user/models/tenant";


declare global {
    namespace Express {
        interface Request {
            user: User;
            tenantId: string;
            permissions: RolePermission[]
        }
    }
}


export class AuthService {
    constructor(
        private readonly userRepo:UserRepository,
        private readonly tenantRepo:TenantRepository
    ) {}

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

            const user = await this.userRepo.findOne( { id: decodedToken.userId} );

            if (!user) throw new NotFoundException("Invalid user");

            req.user = user;
            req.permissions = decodedToken.permissions

            next();
        } catch (error) {
            next(error);
        }
    }


    checkTenant = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tenantKey = req.headers['x-tenant-key'] as string;
    
            if (!tenantKey) throw new UnauthorizedException('Tenant key is required');
            
            const tenant = await this.tenantRepo.findOne( { key: tenantKey } );
            
            if (!tenant) throw new UnauthorizedException('Invalid tenant key');
            
            req.tenantId = tenant.id;

            next();
        } catch (error) {
            next(error);
        }
    }


    authorize = ( resource: string, permission: string ) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            try {
                const userPermissions = req.permissions;

                if(!userPermissions?.length) throw new UnauthorizedException("Unauthorized access");

                const requiredPermission = userPermissions.find(up => {
                    return up.resource_name === resource
                });

                if(!requiredPermission) throw new UnauthorizedException("Unauthorized access");

                if(!requiredPermission[permission] && !requiredPermission.secondary_privileges?.includes(permission)) throw new UnauthorizedException("Unauthorized access");

                return next();
            } catch (error) {
                return next(error);
            }
            
        }
    }
}

export const authService = new AuthService(
    new UserRepository,
    new TenantRepository
);