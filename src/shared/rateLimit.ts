import rateLimit from "express-rate-limit";
import { env_var } from "../config/env/env";


export const rateLimiter = rateLimit({
    windowMs: env_var.RATE_LIMIT_WINDOW_MINS * 60000,
    max: env_var.RATE_LIMIT_REQUEST_COUNT,
    message: "Request limits exceeded. Please try again later"
})
