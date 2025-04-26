import { Options, Sequelize } from 'sequelize';
import * as db_config_opts from './config';
import { env_var } from '../env/env';

const db_config:Options = db_config_opts[env_var.NODE_ENV];

let sequelize = new Sequelize(db_config.database as string, db_config.username as string, db_config.password as string, db_config);

export {db_config, sequelize}
