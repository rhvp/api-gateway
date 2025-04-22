import { Model } from "sequelize";

export interface BaseAttributes {
    created_at?: Date;
    updated_at?: Date;
}

export interface Tenant extends BaseAttributes {
    id: string;
    name: string;
    key: string;
}
export interface TenantAttributes extends Omit<Tenant, 'id'> {}
export interface TenantInstance extends Model<Tenant, TenantAttributes>, Tenant {}


export interface User extends BaseAttributes {
    id: string;
    name: string;
    email: string;
    password: string;
    tenant_id: string;
}
export interface UserAttributes extends Omit<User, 'id'> {}
export interface UserInstance extends Model<User, UserAttributes>, User {}


export interface Permission {
    id: string;
    resource_name: string;
    role_id: string;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    secondary_privileges: string[];
}
export interface PermissionAttributes extends Omit<Permission, 'id'|'secondary_privileges'> {}
export interface PermissionInstance extends Model<Permission, PermissionAttributes>, Permission {}


export interface Role {
    id: string;
    name: string;
}
export interface RoleAttributes extends Omit<Role, 'id'> {}
export interface RoleInstance extends Model<Role, RoleAttributes>, Role {}