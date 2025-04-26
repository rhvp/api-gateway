import { FindOptions, Model } from "sequelize";
import z from "zod";

export interface BaseAttributes {
    created_at?: Date;
    updated_at?: Date;
}

export class BaseRepository {
    private readonly model: any;

    constructor(model: any) {
        this.model = model;
    }

    public async create<T = any>(data: T): Promise<any> {
        return this.model.create(data);
    }

    public async findAll<T = any>(params?: T, includes?: FindOptions<T>): Promise<any[]> {
        const conditions: any = this.getConditions(params);

        return this.model.findAll({ ...conditions, ...includes });
    }

    public async findOne<T = any>(params: T, includes?: FindOptions<T>): Promise<any> {
        const conditions: any = this.getConditions(params);
        return this.model.findOne({ ...conditions, ...includes });
    }


    public async findById(id: string | number, includes?: FindOptions<any>): Promise<any> {
        return this.model.findByPk(id, { ...includes });
    }

    private getConditions(params): object {
        const conditions: any = {};

        if (params) {
            conditions.where = params;
        }

        return conditions;
    }
}

export interface Tenant extends BaseAttributes {
    id: string;
    name: string;
    key: string;
}
export interface TenantAttributes extends Omit<Tenant, 'id'> { }
export interface TenantInstance extends Model<Tenant, TenantAttributes>, Tenant { }


export interface User extends BaseAttributes {
    id: string;
    name: string;
    email: string;
    password: string;
    tenant_id: string;
    role_id: string;
}
export interface UserAttributes extends Omit<User, 'id'> { }
export interface UserInstance extends Model<User, UserAttributes>, User { }


export interface RolePermission {
    id: string;
    resource_name: string;
    role_id: string;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    secondary_privileges: string[];
}
export interface PermissionAttributes extends Omit<RolePermission, 'id' | 'secondary_privileges'> { }
export interface PermissionInstance extends Model<RolePermission, PermissionAttributes>, RolePermission { }

export interface Role extends BaseAttributes {
    id: string;
    name: string;
    tenant_id: string;
    permissions?: RolePermission[];
}
export interface RoleAttributes extends Omit<Role, 'id'> { }
export interface RoleInstance extends Model<Role, RoleAttributes>, Role { }


export interface UserSignup {
    name: string;
    email: string;
    password: string;
    tenant_id: string;
}

export interface UserLogin {
    email: string;
    password: string;
    tenant_id: string;
}

export interface OauthLogin {
    code: string;
    tenant_id: string;
}

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export const oauthSchema = z.object({
    code: z.string(),
})

export const signupSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
})

export const productSchema = z.object({
    name: z.string(),
    price: z.number(),
})