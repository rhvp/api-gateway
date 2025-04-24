import { NextFunction, Request, Response } from "express";
import gatewayService, { ServiceRoutingOptions } from "./gateway.service";
import { Method } from "axios";
import { GatewayServiceName } from "../config/constants/services";

class GatewayController {
    private getRouteParams = (req: Request) => {
        let params = {};
        if (req.params) {
            Object.keys(req.params).forEach((key) => {
                params[key] = req.params[key];
            });
        }
        return params;
    }

    private setResponseHeaders = (serviceRes: any, res:Response) => {
        Object.keys(serviceRes.headers).forEach((key) => {
            res.setHeader(key, serviceRes.headers[key]);
        });
    }

    routeProductService = async(req: Request, res: Response, next: NextFunction) => {
        try {
            let payload: ServiceRoutingOptions = {
                service_name: GatewayServiceName.product,
                route_key: req.route.path,
                method: req.method as Method,
                params: this.getRouteParams(req),
                query: req.query,
                body: req.body,
                headers: {
                    ...req.headers,
                },
                user_id: <string>req.headers["x-user-id"],
                tenant_id: <string>req.headers["x-tenant-id"],
            };
    
            const response = await gatewayService.routeToService(payload);

            Object.keys(response.headers).forEach((key) => {
                res.setHeader(key, response.headers[key]);
            });
    
            res.status(response.status).json({
                status: response.status,
                data: response.data,
            });
            return;
        } catch (error) {
            next(error);
        }
    }


    routeUserService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            let payload: ServiceRoutingOptions = {
                service_name: GatewayServiceName.user,
                route_key: req.route.path,
                method: req.method as Method,
                params: this.getRouteParams(req),
                query: req.query,
                body: req.body,
                headers: {
                    ...req.headers,
                },
                user_id: <string>req.headers["x-user-id"],
                tenant_id: <string>req.headers["x-tenant-id"],
            };
    
            const response = await gatewayService.routeToService(payload);

            Object.keys(response.headers).forEach((key) => {
                res.setHeader(key, response.headers[key]);
            });
    
            res.json({
                status: response.status,
                data: response.data,
            });
            return;
        } catch (error) {
            next(error);
        }
    }
}

export const gatewayController = new GatewayController();