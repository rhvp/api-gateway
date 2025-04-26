import axios, { AxiosRequestConfig } from "axios";
import { Method } from "axios";
import { GatewayServiceName, GatewayServiceFactory } from "../config/constants/services";
import { NotFoundException, MethodNotAllowedException, ServiceUnavailableException } from "../shared/error/builder";
import { Logger } from "../shared/logger";

export interface ServiceRoutingOptions {
    service_name: GatewayServiceName;
    route_key: string;
    method: Method;
    tenant_id: string;
    params?: any;
    query?: any;
    body?: any;
    headers?: any;
    user_id?: string;
}


export class GatewayService {
    private readonly services = GatewayServiceFactory;
    private readonly logger = new Logger(GatewayService.name);

    private readonly forwardHeaders = ["content-type", "x-tenant-id", "x-user-id", "content-length"];

    private sanitizeResponseHeaders = (headers: any) => {
        const sanitizedHeaders: any = {};
        Object.keys(headers).forEach((key) => {
            if (this.forwardHeaders.includes(key.toLowerCase()) ) {
                sanitizedHeaders[key] = headers[key];
            }
        });
        return sanitizedHeaders;
    }

    async routeToService (data:ServiceRoutingOptions) {
        try {
            let {params} = data;
            let route_key = data.route_key.replace("/", "")
            const service = this.services[data.service_name];
            if(!service) throw new NotFoundException(`Service ${data.service_name} not found`);
            const route = service.routes[route_key];
            if(!route) throw new NotFoundException(`Route ${route_key} not found in service ${data.service_name}`);
            if(!route.methods.includes(data.method)) throw new MethodNotAllowedException(`Method ${data.method} not allowed for route ${route_key}`);

            let path = route.path;

            if(params) {
                Object.keys(params).forEach((key) => {
                    path = path.replace(`:${key}`, params[key]);
                });
            }

            const url = `${service.baseUrl}${path}`;
            const options:AxiosRequestConfig = {
                method: data.method,
                url,
                params: data.params,
                data: data.body,
                headers: {
                    ...data.headers,
                    'Content-Type': 'application/json',
                    'X-User-ID': data.user_id,
                    'X-Tenant-ID': data.tenant_id
                },
            }
            const response = await axios.request(options);

            this.logger.info(`GatewayService response: ${response.status}`, {
                service: data.service_name,
                route: data.route_key,
                tenant: data.tenant_id,
                user: data.user_id,
                response: response.data,
                headers: response.headers,
            });

            let sanitizedHeaders = this.sanitizeResponseHeaders(response.headers);

            return {
                status: response.status,
                data: response.data,
                headers: sanitizedHeaders,
            }
        } catch (error) {
            if(error.response) {
                this.logger.error(`GatewayService error: ${error.message}`, {
                    error: error.response.data,
                    service: data.service_name,
                    route: data.route_key,  
                    tenant: data.tenant_id
                });
                return {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                }
            }

            this.logger.error(`Gateway error: ${error.message}`, {
                error: error.stack,
                service: data.service_name,
                route: data.route_key,  
                tenant: data.tenant_id
            });

            throw new ServiceUnavailableException();
        }
    }
}


export default new GatewayService();