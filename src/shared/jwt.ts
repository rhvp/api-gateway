
import jwt from 'jsonwebtoken';
import { env_var } from '../config/env/env';
import { RolePermission } from '../user/models/base';


export interface TokenPayload {
    userId: string;
    tenantId: string;
    role: string;
    permissions: RolePermission[];
}

class JWTService {
    generateToken = (payload: TokenPayload): string => {
        let options = {
            expiresIn: <any>env_var.JWT_EXPIRES_IN,
        }
        return jwt.sign(payload, env_var.JWT_SECRET, options);
    }
    
    verifyToken = (token: string): TokenPayload | null => {
        try {
            return jwt.verify(token, env_var.JWT_SECRET) as TokenPayload;
        } catch (error) {
            return null;
        }
    }
    
    decodeToken = (token: string): TokenPayload | null => {
        try {
            return jwt.decode(token) as TokenPayload;
        } catch (error) {
            return null;
        }
    }
}

export const jwtService = new JWTService();