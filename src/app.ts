
import { errorHandler } from "./shared/error/handler";
import { AppError, NotFoundException } from "./shared/error/builder";
import express, { Application, NextFunction, Request, Response } from "express";
import router from "./router";
import cors from 'cors';
import helmet from "helmet";
import morganMiddleware from "./middleware/logger";
import { rateLimiter } from "./shared/rateLimit";


const app: Application = express();

app.use(cors());
app.use(helmet({}));
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({limit: '1mb', extended: true}));
app.use(morganMiddleware);

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('App running...');
});

app.use(rateLimiter);
app.use(router);

app.use((req: Request, res: Response, next: NextFunction) => {
    let err: AppError = new NotFoundException(`${req.ip} tried to reach a resource at ${req.originalUrl} that is not on this server.`);
    next(err);
});

app.use(errorHandler);

export {app};