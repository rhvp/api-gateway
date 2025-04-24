import { env_var } from './config/env/env';
import { app } from './app';

const port = env_var.PORT;

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