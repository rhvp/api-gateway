import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { UserLogin, UserSignup } from "./models/base";
import { userService } from "./user.service";



class UserController {
    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            let payload:UserLogin = {
                email, password,
                tenant_id: req.tenantId
            }

            const result = await userService.login(payload);

            res.status(200).json({
                success: true,
                message: 'Authentication successful',
                data: result
            });
        } catch (error) {
            return next(error);
        }
    }


    signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let { name, email, password } = req.body;

            let payload: UserSignup = {
                name, email, password,
                tenant_id: req.tenantId
            }

            const result = await userService.signup(payload);

            res.status(HttpStatusCode.Ok).json({
                status: "success",
                message: "Signup success",
                data: result
            })
            return;
        } catch (error) {
            return next(error);
        }
    }
}

export const userController = new UserController();