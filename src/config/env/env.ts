import * as dotenv from 'dotenv';
dotenv.config();

interface env {
    PORT: string;
    NODE_ENV: string;
    DB_NAME: string;
    DB_HOST: string;
    DB_PASSWORD: string;
    DB_USER: string;
    DB_DIALECT: string;
    DB_PORT: string;
    PRODUCT_SERVICE_URL: string;
    PAYMENT_SERVICE_URL: string;
    USER_SERVICE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    RATE_LIMIT_WINDOW_MINS: number;
    RATE_LIMIT_REQUEST_COUNT: number;
}

export const env_var:env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    DB_HOST: process.env.DB_HOST || "127.0.0.1",
    DB_NAME: process.env.DB_NAME || "api_gateway",
    DB_PORT: <string>process.env.DB_PORT,
    DB_PASSWORD: <string>process.env.DB_PASSWORD,
    DB_USER: <string>process.env.DB_USER,
    DB_DIALECT: <string>process.env.DB_DIALECT,
    PORT: process.env.PORT || "5000",
    PRODUCT_SERVICE_URL: <string>process.env.PRODUCT_SERVICE_URL,
    USER_SERVICE_URL: <string>process.env.USER_SERVICE_URL,
    PAYMENT_SERVICE_URL: <string>process.env.PAYMENT_SERVICE_URL,
    JWT_SECRET: <string>process.env.JWT_SECRET,
    JWT_EXPIRES_IN: <string>process.env.JWT_EXPIRES_IN || "1h",
    RATE_LIMIT_WINDOW_MINS: parseInt(<string>process.env.RATE_LIMIT_WINDOW_MINS) || 1,
    RATE_LIMIT_REQUEST_COUNT: parseInt(<string>process.env.RATE_LIMIT_WINDOW_MINS) || 30,
}