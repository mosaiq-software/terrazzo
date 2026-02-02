import type { Sequelize as SequelizeType } from 'sequelize';
import { Model, ModelStatic, Options, Sequelize } from 'sequelize';

export type DbConfig = Options & {};
export type DbConfigs = Record<string, DbConfig>;

export type DbModel = ModelStatic<Model> & { associate?: (db: Db) => void };

export type Db = {
    sequelize: SequelizeType;
    Sequelize: typeof Sequelize;
    [key: string]: DbModel | SequelizeType | typeof Sequelize;
};
