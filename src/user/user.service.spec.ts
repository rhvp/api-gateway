import { UserService } from './user.service';
import { jwtService } from '../shared/jwt';
import { googleAuth } from '../shared/auth/google';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
  UnprocessableEntityException
} from '../shared/error/builder';
import { Tenant } from './models/base';
import { MockRepository } from '../config/mock';
import { crypt } from '../shared/crypt';


describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockRepository;
  let roleRepository: MockRepository;
  let tenantRepository: MockRepository;

  beforeEach(() => {
    userRepository = new MockRepository({});
    roleRepository = new MockRepository({});
    tenantRepository = new MockRepository({});
    userService = new UserService(userRepository, roleRepository, tenantRepository);
  });

  describe('signup', () => {
    const mockSignupData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      tenant_id: 'tenant-123'
    };

    const mockTenant = { id: 'tenant-123' };
    const mockRole = { id: 'role-123', name: 'default' };
    const mockUser = { id: 'user-123', ...mockSignupData };


    it('should successfully create a new user', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);
      jest.spyOn(crypt, 'hashPassword').mockImplementation();
      let mockValidateTenant = jest.spyOn(<any>userService, 'validateTenant').mockImplementation();
      mockValidateTenant.mockResolvedValue(mockTenant)

      const result = await userService.signup(mockSignupData);

      expect(userRepository.findOne).toHaveBeenCalledWith({ email: mockSignupData.email });
      expect(roleRepository.findOne).toHaveBeenCalledWith({ name: 'default', tenant_id: mockTenant.id });
      expect(userRepository.create).toHaveBeenCalled();
      expect(mockValidateTenant).toHaveBeenCalled();
      expect(jest.spyOn(crypt, 'hashPassword')).toHaveBeenCalledWith(mockSignupData.password);
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      await expect(userService.signup(mockSignupData))
        .rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(null);

      await expect(userService.signup(mockSignupData))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if default role does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(mockTenant);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.signup(mockSignupData))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('login', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123',
      tenant_id: 'tenant-123'
    };

    const mockUser = {
      id: 'user-123',
      email: mockLoginData.email,
      password: 'hashedPassword',
      tenant_id: mockLoginData.tenant_id,
      role_id: 'role-123'
    };

    const mockRole = {
      id: 'role-123',
      name: 'admin',
      permissions: ['read', 'write']
    };

    const mockToken = 'generated.jwt.token';

    it('should successfully login with valid credentials', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(crypt, 'compareHash').mockResolvedValue(true);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
      jest.spyOn(jwtService, 'generateToken').mockReturnValue(mockToken);

      const result = await userService.login(mockLoginData);

      expect(userRepository.findOne).toHaveBeenCalledWith({ email: mockLoginData.email, tenant_id: mockLoginData.tenant_id });
      expect(jest.spyOn(crypt, 'compareHash')).toHaveBeenCalledWith(mockLoginData.password, mockUser.password);
      expect(roleRepository.findOne).toHaveBeenCalledWith({ id: mockUser.role_id },
        {
          include: ['permissions']
        });
      expect(jwtService.generateToken).toHaveBeenCalledWith({
        userId: mockUser.id,
        tenantId: mockUser.tenant_id,
        role: mockRole.name,
        permissions: mockRole.permissions
      });
      expect(result).toEqual({
        user: mockUser,
        role: mockRole,
        token: mockToken
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.login(mockLoginData))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(crypt, 'compareHash').mockResolvedValue(false);

      await expect(userService.login(mockLoginData))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('oauthLogin', () => {
    const mockOauthData = {
      code: 'auth-code-123',
      tenant_id: 'tenant-123'
    };

    const mockTenant = { id: 'tenant-123' };
    const mockUserData = { email: 'test@example.com', name: 'Test User' };
    const mockOauthToken = 'oauth-token-123';
    const mockUser = {
      id: 'user-123',
      email: mockUserData.email,
      tenant_id: mockTenant.id,
      role_id: 'role-123'
    };
    const mockRole = {
      id: 'role-123',
      name: 'default',
      permissions: ['read']
    };
    const mockToken = 'generated.jwt.token';

    it('should successfully login existing user with OAuth', async () => {
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(mockTenant);
      jest.spyOn(googleAuth, 'getAccessToken').mockResolvedValue(mockOauthToken);
      jest.spyOn(googleAuth, 'getAuthenticatedUser').mockResolvedValue(mockUserData);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
      jest.spyOn(jwtService, 'generateToken').mockReturnValue(mockToken);

      const result = await userService.oathLogin(mockOauthData);

      expect(tenantRepository.findById).toHaveBeenCalledWith(mockOauthData.tenant_id);
      expect(jest.spyOn(googleAuth, 'getAccessToken')).toHaveBeenCalledWith(mockOauthData.code);
      expect(jest.spyOn(googleAuth, 'getAuthenticatedUser')).toHaveBeenCalledWith(mockOauthToken);
      expect(userRepository.findOne).toHaveBeenCalledWith({ email: mockUserData.email, tenant_id: mockTenant.id });
      expect(roleRepository.findOne).toHaveBeenCalledWith({ id: mockUser.role_id },
        {
          include: ['permissions']
        });
      expect(result).toEqual({
        user: mockUser,
        role: mockRole,
        token: mockToken
      });
    });

    it('should create and login new user with OAuth', async () => {
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(mockTenant);
      jest.spyOn(googleAuth, 'getAccessToken').mockResolvedValue(mockOauthToken);
      jest.spyOn(googleAuth, 'getAuthenticatedUser').mockResolvedValue(mockUserData);
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);
      jest.spyOn(roleRepository, 'findOne')
        .mockResolvedValueOnce(mockRole)
        .mockResolvedValueOnce(mockRole);
      jest.spyOn(crypt, 'hashPassword').mockResolvedValue('hashedPassword');
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);
      jest.spyOn(jwtService, 'generateToken').mockReturnValue(mockToken);

      const result = await userService.oathLogin(mockOauthData);

      expect(userRepository.create).toHaveBeenCalledWith({
        name: mockUserData.name,
        email: mockUserData.email,
        password: expect.any(String),
        role_id: mockRole.id,
        tenant_id: mockTenant.id
      });
      expect(result).toEqual({
        user: mockUser,
        role: mockRole,
        token: mockToken
      });
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(null);

      await expect(userService.oathLogin(mockOauthData))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw UnprocessableEntityException if token exchange fails', async () => {
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(mockTenant);
      (googleAuth.getAccessToken as jest.Mock).mockResolvedValue(null);

      await expect(userService.oathLogin(mockOauthData))
        .rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw ServiceUnavailableException if user data fetch fails', async () => {
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(mockTenant);
      (googleAuth.getAccessToken as jest.Mock).mockResolvedValue(mockOauthToken);
      (googleAuth.getAuthenticatedUser as jest.Mock).mockResolvedValue(null);

      await expect(userService.oathLogin(mockOauthData))
        .rejects.toThrow(ServiceUnavailableException);
    });

    it('should throw ForbiddenException if default role does not exist', async () => {
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(mockTenant);
      (googleAuth.getAccessToken as jest.Mock).mockResolvedValue(mockOauthToken);
      (googleAuth.getAuthenticatedUser as jest.Mock).mockResolvedValue(mockUserData);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.oathLogin(mockOauthData))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('validateTenant', () => {
    it('should return tenant if it exists', async () => {
      const mockTenant = { id: 'tenant-123' };
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(mockTenant);

      const result = await userService['validateTenant']('tenant-123');
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      jest.spyOn(tenantRepository, 'findById').mockResolvedValue(null);

      await expect(userService['validateTenant']('invalid-tenant'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('createOauthUser', () => {
    const mockName = 'Test User';
    const mockEmail = 'test@example.com';
    const mockTenant = { id: 'tenant-123' };
    const mockRole = { id: 'role-123', name: 'default' };
    const mockUser = {
      id: 'user-123',
      name: mockName,
      email: mockEmail,
      tenant_id: mockTenant.id,
      role_id: mockRole.id
    };

    it('should successfully create a new OAuth user', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole);
      jest.spyOn(crypt, 'hashPassword').mockResolvedValue('hashedPassword');
      jest.spyOn(userRepository, 'create').mockResolvedValue(mockUser);

      const result = await userService['createOauthUser'](mockName, mockEmail, <Tenant>mockTenant);

      expect(roleRepository.findOne).toHaveBeenCalledWith({ name: 'default', tenant_id: mockTenant.id });
      expect(jest.spyOn(crypt, 'hashPassword')).toHaveBeenCalledWith(expect.any(String));
      expect(userRepository.create).toHaveBeenCalledWith({
        name: mockName,
        email: mockEmail,
        password: 'hashedPassword',
        role_id: mockRole.id,
        tenant_id: mockTenant.id
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ForbiddenException if default role does not exist', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await expect(userService['createOauthUser'](mockName, mockEmail, <Tenant>mockTenant))
        .rejects.toThrow(ForbiddenException);
    });
  });
});