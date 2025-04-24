import { Request, Response, NextFunction } from 'express';
import { BadRequestException, InternalServerException } from '../shared/error/builder';
import { z, ZodError } from 'zod';


class RequestValidator {
    validateBody(schema: z.ZodObject<any, any>) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errorMessages = error.errors.map((issue: any) => ({
                        message: `${issue.path.join('.')} is ${issue.message}`,
                    }))
                    throw new BadRequestException(`Invalid request data: ${JSON.stringify(errorMessages)}`);
                } else {
                    throw new InternalServerException();
                }
            }
        }
    }


    validateQuery(schema: z.ZodObject<any, any>) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.query);
                next();
            } catch (error) {
                if (error instanceof ZodError) {
                    const errorMessages = error.errors.map((issue: any) => ({
                        message: `${issue.path.join('.')} is ${issue.message}`,
                    }))
                    throw new BadRequestException(`Invalid request data: ${errorMessages}`);
                } else {
                    throw new InternalServerException();
                }
            }
        }
    }
}

export const requestValidator = new RequestValidator();