import { Request, Response, NextFunction } from 'express';
import {
    ForbiddenException,
    NotFoundException,
    UnauthorizedException
} from '../shared/error/builder';
import { jwtService } from '../shared/jwt';
import UserRepository from '../user/models/user';
import TenantRepository from '../user/models/tenant';
import { AuthService } from './authentication';
import { v4 } from 'uuid';
import { MockRepository } from '../config/mock';

// Mock dependencies
jest.mock('../shared/jwt');
jest.mock('../user/models/user');
jest.mock('../user/models/tenant');

describe('AuthService', () => {
    let authService: AuthService;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.MockedFunction<NextFunction>;
    let userRepo: UserRepository;
    let tenantRepo: TenantRepository;

    beforeEach(() => {
        jest.clearAllMocks();

        mockNext = jest.fn();
        mockResponse = {};
        mockRequest = {
            headers: {},
            tenantId: 'valid-tenant-id'
        };

        userRepo = new MockRepository({});
        tenantRepo = new MockRepository({});

        authService = new AuthService(userRepo, tenantRepo);
    });

    describe('authenticate', () => {
        const validToken = 'valid-token';
        const decodedToken = {
            userId: 'user-123',
            tenantId: 'valid-tenant-id',
            permissions: [
                { resource_name: 'resource1', read: true, write: false, secondary_privileges: [] }
            ]
        };
        const mockUser = { id: 'user-123', name: 'Test User' };

        it('should authenticate user with valid token', async () => {

            mockRequest.headers = { authorization: `Bearer ${validToken}` };
            (jwtService.decodeToken as jest.Mock).mockReturnValue(decodedToken);
            jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);


            await authService.authenticate(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(jwtService.decodeToken).toHaveBeenCalledWith(validToken);
            expect(userRepo.findOne).toHaveBeenCalledWith({ id: decodedToken.userId });
            expect(mockRequest.user).toEqual(mockUser);
            expect(mockRequest.permissions).toEqual(decodedToken.permissions);
            expect(mockNext).toHaveBeenCalledWith();
        });

        it('should throw UnauthorizedException if no auth header', async () => {
            mockRequest.headers = {};

            await authService.authenticate(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });

        it('should throw UnauthorizedException if invalid auth header format', async () => {
            mockRequest.headers = { authorization: 'InvalidFormat' };

            await authService.authenticate(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });

        it('should throw UnauthorizedException if token is invalid', async () => {
            mockRequest.headers = { authorization: `Bearer ${validToken}` };
            (jwtService.decodeToken as jest.Mock).mockReturnValue(null);

            await authService.authenticate(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });

        it('should throw ForbiddenException if tenant mismatch', async () => {
            mockRequest.headers = { authorization: `Bearer ${validToken}` };
            (jwtService.decodeToken as jest.Mock).mockReturnValue({
                ...decodedToken,
                tenantId: 'different-tenant-id'
            });

            await authService.authenticate(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenException));
        });

        it('should throw NotFoundException if user not found', async () => {
            mockRequest.headers = { authorization: `Bearer ${validToken}` };
            (jwtService.decodeToken as jest.Mock).mockReturnValue(decodedToken);
            jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

            await authService.authenticate(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundException));
        });
    });

    describe('checkTenant', () => {
        const mockTenant = { id: 'tenant-123', key: 'valid-tenant-key' };

        it('should set tenantId with valid tenant key', async () => {
            mockRequest.headers = { 'x-tenant-key': 'valid-tenant-key' };
            jest.spyOn(tenantRepo, 'findOne').mockResolvedValue(mockTenant);

            await authService.checkTenant(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(tenantRepo.findOne).toHaveBeenCalledWith({ key: 'valid-tenant-key' });
            expect(mockRequest.tenantId).toBe('tenant-123');
            expect(mockNext).toHaveBeenCalledWith();
        });

        it('should throw UnauthorizedException if no tenant key', async () => {
            mockRequest.headers = {};

            await authService.checkTenant(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });

        it('should throw UnauthorizedException if invalid tenant key', async () => {
            mockRequest.headers = { 'x-tenant-key': 'invalid-key' };
            jest.spyOn(tenantRepo, 'findOne').mockResolvedValue(null);

            await authService.checkTenant(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });
    });

    describe('authorize', () => {
        const mockPermissions = [
            {
                id: v4(),
                role_id: v4(),
                resource_name: 'resource1',
                can_read: true,
                can_create: false,
                can_update: false,
                can_delete: false,
                secondary_privileges: ['export']
            },
            {
                id: v4(),
                role_id: v4(),
                resource_name: 'resource2',
                can_read: true,
                can_create: false,
                can_update: false,
                can_delete: false,
                secondary_privileges: []
            }
        ];

        beforeEach(() => {
            mockRequest.permissions = mockPermissions;
        });

        it('should authorize with primary permission', async () => {
            const middleware = authService.authorize('resource1', 'read');

            await middleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalled();
        });

        it('should authorize with secondary permission', async () => {
            const middleware = authService.authorize('resource1', 'export');

            await middleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalled();
        });

        it('should throw UnauthorizedException if no permissions', async () => {
            mockRequest.permissions = undefined;
            const middleware = authService.authorize('resource1', 'read');

            await middleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });

        it('should throw UnauthorizedException if resource not found', async () => {
            const middleware = authService.authorize('unknown-resource', 'read');

            await middleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });

        it('should throw UnauthorizedException if permission denied', async () => {
            const middleware = authService.authorize('resource1', 'write');

            await middleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });

        it('should throw UnauthorizedException if secondary permission denied', async () => {
            const middleware = authService.authorize('resource1', 'import');

            await middleware(
                mockRequest as Request,
                mockResponse as Response,
                mockNext
            );

            expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedException));
        });
    });
});