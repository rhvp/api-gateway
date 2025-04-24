import { Method } from "axios";
import { env_var } from "../env/env";

export interface GatewaySerivce {
    baseUrl: string;
    routes: {
        [key: string]: {
            path: string;
            methods: Method[];
            requiredPermissions?: string[];
        };
    };
}

export enum GatewayServiceName {
    product = "product",
    user = "user",
    payment = "payment",

}

export const GatewayServiceFactory: { [key in GatewayServiceName]: GatewaySerivce } = {
    user: {
        baseUrl: env_var.USER_SERVICE_URL,
        routes: {
            "users": {
                path: "/users",
                methods: ["GET", "POST"],
            }
        },
    },
    product: {
        baseUrl: env_var.PRODUCT_SERVICE_URL,
        routes: {
            "products": {
                path: "/products",
                methods: ["GET", "POST"],
            },
            "products/:id": {
                path: "/products/:id",
                methods: ["GET", "PUT", "DELETE"],
            }
        }
    },
    payment: {
        baseUrl: env_var.PAYMENT_SERVICE_URL,
        routes: {
            "payments": {
                path: "/payments",
                methods: ["GET", "POST"],
            }
        }
    }
}