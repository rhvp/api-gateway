import { ConflictException, ForbiddenException, NotFoundException, UnauthorizedException } from "../shared/error/builder";
import { UserLogin, UserSignup } from "./models/base";
import UserModel from "./models/user";
import bcrypt, { genSaltSync } from 'bcryptjs';
import RoleModel from "./models/role";
import { jwtService, TokenPayload } from "../shared/jwt";
import TenantModel from "./models/tenant";

class UserService {

    private validateTenant = async (tenant_id: string) => {
        const tenant = await TenantModel.findByPk(tenant_id);
        if (!tenant) throw new NotFoundException('Invalid tenant');
        return tenant;
    }


    signup = async (data: UserSignup) => {
        let {email, tenant_id} = data;

        const existingUser = await UserModel.findOne({where: {email}});
        if (existingUser) throw new ConflictException('User already exists');

        const tenant = await this.validateTenant(tenant_id);

        const hashedPassword = await bcrypt.hash(data.password, genSaltSync(10));

        const defaultRole = await RoleModel.findOne({
            where: { name: 'default', tenant_id: tenant.id }
        });

        if (!defaultRole) throw new ForbiddenException('Invalid tenant role setup');

        const user = await UserModel.create({
            ...data,
            password: hashedPassword,
            role_id: defaultRole.id,
        })

        return user;
    }


    login = async (data:UserLogin) => {
        const {email, password, tenant_id} = data;

        const user = await UserModel.findOne({where: {email, tenant_id}});

        if (!user) throw new NotFoundException('User not found');

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

        const role = await RoleModel.findOne({where: {id: user.role_id}, include: ['permissions']});

        let tokenPayload:TokenPayload = {
            userId: user.id,
            tenantId: user.tenant_id,
            role: role?.name || '',
            permissions: role?.permissions || []
        }

        const token = jwtService.generateToken(tokenPayload);

        return {
            user,
            token
        };
    }
}

export const userService = new UserService();