import { ConflictException, ForbiddenException, NotFoundException, ServiceUnavailableException, UnauthorizedException, UnprocessableEntityException } from "../shared/error/builder";
import { OauthLogin, Tenant, UserLogin, UserSignup } from "./models/base";
import { jwtService, TokenPayload } from "../shared/jwt";
import { googleAuth } from "../shared/auth/google";
import UserRepository from "./models/user";
import RoleRepository from "./models/role";
import TenantRepository from "./models/tenant";
import { crypt } from "../shared/crypt";

export class UserService {

    constructor(
        private readonly userRepository:UserRepository,
        private readonly roleRepository:RoleRepository,
        private readonly tenantRepository:TenantRepository,
    ) {}


    signup = async (data: UserSignup) => {
        let {email, tenant_id} = data;

        const existingUser = await this.userRepository.findOne({email});
        if (existingUser) throw new ConflictException('User already exists');

        const tenant = await this.validateTenant(tenant_id);

        const hashedPassword = await crypt.hashPassword(data.password);

        const defaultRole = await this.roleRepository.findOne( { name: 'default', tenant_id: tenant.id });

        if (!defaultRole) throw new ForbiddenException('Invalid tenant role setup');

        const user = await this.userRepository.create({
            ...data,
            password: hashedPassword,
            role_id: defaultRole.id,
        })

        return user;
    }


    login = async (data:UserLogin) => {
        const {email, password, tenant_id} = data;

        const user = await this.userRepository.findOne({email, tenant_id});

        if (!user) throw new NotFoundException('User not found');

        const isPasswordValid = await crypt.compareHash(password, user.password);

        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        const role = await this.roleRepository.findOne({id: user.role_id}, {include: ['permissions']});

        let tokenPayload:TokenPayload = {
            userId: user.id,
            tenantId: user.tenant_id,
            role: role?.name || '',
            permissions: role?.permissions || []
        }

        const token = jwtService.generateToken(tokenPayload);

        return {
            user,
            role,
            token
        };
    }


    oathLogin = async (data:OauthLogin) => {
        let {code, tenant_id} = data;

        const tenant = await this.validateTenant(tenant_id);

        const oauthToken = await googleAuth.getAccessToken(code);

        if(!oauthToken) throw new UnprocessableEntityException("Error validating auth code");

        const userData = await googleAuth.getAuthenticatedUser(oauthToken);

        if(!userData) throw new ServiceUnavailableException("Error fetching authorized user");

        const {email, name} = userData;

        let user = await this.userRepository.findOne({ email, tenant_id});

        if(!user) user = await this.createOauthUser(name, email, tenant);

        const role = await this.roleRepository.findOne({id: user.role_id}, {include: ['permissions']});

        let tokenPayload:TokenPayload = {
            userId: user.id,
            tenantId: user.tenant_id,
            role: role?.name || '',
            permissions: role?.permissions || []
        }

        const token = jwtService.generateToken(tokenPayload);

        return {
            user,
            role,
            token
        };
    }

    private validateTenant = async (tenant_id: string) => {
        const tenant = await this.tenantRepository.findById(tenant_id);
        if (!tenant) throw new NotFoundException('Invalid tenant');
        return tenant;
    }


    private createOauthUser = async (name:string, email:string, tenant:Tenant) => {
        let defaultPass = Math.random().toString(36).slice(-10);

        let hash = await crypt.hashPassword(defaultPass);

        const role = await this.roleRepository.findOne({ name: 'default', tenant_id: tenant.id });

        if (!role) throw new ForbiddenException('Invalid tenant role setup');

        const user = await this.userRepository.create({
            name,
            email,
            password: hash,
            role_id: role.id,
            tenant_id: tenant.id
        })

        return user
    }
}

export const userService = new UserService(
    new UserRepository,
    new RoleRepository,
    new TenantRepository
);