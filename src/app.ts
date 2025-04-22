
import { errorHandler } from "./config/error/handler";
import { AppError } from "./config/error/builder";
import express, { Application, NextFunction, Request, Response } from "express";


const app: Application = express();

app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({limit: '1mb', extended: true}));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('App running...');
});

app.use((req: Request, res: Response, next: NextFunction) => {
    let err: AppError = new AppError(`${req.ip} tried to reach a resource at ${req.originalUrl} that is not on this server.`, 404);
    next(err);
});

app.use(errorHandler);

export {app};