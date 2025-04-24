import morgan, { StreamOptions } from "morgan";
import moment from 'moment';
import { Logger } from "../shared/logger";
import { Request, Response } from "express";

const logger = new Logger("Http-Request");
const stream: StreamOptions = {
    write: (message) => logger.info(message),
};

morgan.token('ip', (request: Request, response: Response) => request.ip);
morgan.token('timestamp', () => moment().format());
morgan.token('body', (request: Request, response: Response) => {
    let req_body = request.body;
    if(!req_body) return "";
    delete req_body.password;
    return JSON.stringify(req_body);
});

const morganMiddleware = morgan(
    ":method :url :status :res[content-length] - :response-time ms :ip :timestamp :body",
    { stream }
);

export default morganMiddleware;