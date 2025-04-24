import { NextFunction, Request, Response } from "express";
import { AppError } from "./builder";
import { Logger } from "../../shared/logger";

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {

    new Logger('Error').error(err.message);

    if (err.isOperational) {
        res.status(err.statusCode).json({
            error: {
                message: err.message
            }
        })
    }

    else if(err.name === 'JsonWebTokenError'){
        res.status(err.statusCode || 401).json({
            error: {
                title: err.name,
                message: err.message
            }
        })
    }

    else if(err.name === 'TokenExpiredError'){
        res.status(err.statusCode || 401).json({
            error: {
                title: err.name,
                message: err.message
            }
        })
    }

    else if(err.name === 'SequelizeDatabaseError') {
        res.status(err.statusCode || 409).json({
            error: {
                title: err.name,
                message: "Something went wrong in the server"
            }
        })
    }

    else {
        res.status(err.statusCode ?? 500).json({
            error: {
                message: err.message ?? "Something went wrong in the server"
            }
        })
    }

}