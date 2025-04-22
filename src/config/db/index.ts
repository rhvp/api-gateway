import * as dotenv from 'dotenv';
dotenv.config();
import { Options, Sequelize } from 'sequelize';
import db_config_opts from './config';

let env = process.env.NODE_ENV || "development";

const db_config:Options = db_config_opts[env]

let sequelize = new Sequelize(db_config.database as string, db_config.username as string, db_config.password as string, db_config);

export {db_config, sequelize}
