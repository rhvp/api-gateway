import * as dotenv from 'dotenv';
import { app } from './app';

dotenv.config();

const port: any = process.env.PORT || 5000;

app.listen(port, ()=>{
    console.info(`App running on Port: ${port}`);
})

process.on('uncaughtException', (err) => {
    console.warn('Uncaught Exception!!' + err);
    console.error(err.stack);
});

process.on('unhandledRejection', (err) =>{
    console.warn('Unhandled Rejection!!' + err);
});