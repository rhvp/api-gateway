import { NextFunction, Request, Response } from "express";
import { AppError } from "./builder";

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    
    console.error(err.stack);
    console.error(`${err.name}: ${err.message}`);

     
        if(err.isOperational) {
            res.status(err.statusCode).json({
                error: {
                    message: err.message
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