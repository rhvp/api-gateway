import { HttpStatusCode } from "axios";

export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor)
    }
}

export class NotFoundException extends AppError {
    constructor(message = 'Resource not found') {
        super(message, HttpStatusCode.NotFound);
    }
}

export class BadRequestException extends AppError {
    constructor(message = 'Invalid request') {
        super(message, HttpStatusCode.BadRequest);
    }
}

export class ConflictException extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, HttpStatusCode.Conflict);
    }
}

export class UnauthorizedException extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, HttpStatusCode.Unauthorized);
    }
}

export class ForbiddenException extends AppError {
    constructor(message = 'Forbidden access') {
        super(message, HttpStatusCode.Forbidden);
    }
}

export class InternalServerException extends AppError {
    constructor(message = 'Internal server error') {
        super(message, HttpStatusCode.InternalServerError);
    }
}

export class ServiceUnavailableException extends AppError {
    constructor(message = 'Service unavailable') {
        super(message, HttpStatusCode.ServiceUnavailable);
    }
}

export class GatewayTimeoutException extends AppError {
    constructor(message = 'Gateway timeout') {
        super(message, HttpStatusCode.GatewayTimeout);
    }
}

export class MethodNotAllowedException extends AppError {
    constructor(message = 'Method not allowed') {
        super(message, HttpStatusCode.MethodNotAllowed);
    }
}

export class UnprocessableEntityException extends AppError {
    constructor(message = 'Unprocessable entity') {
        super(message, HttpStatusCode.UnprocessableEntity);
    }
}