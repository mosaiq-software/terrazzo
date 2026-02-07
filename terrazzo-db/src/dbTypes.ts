import type { Sequelize as SequelizeType } from 'sequelize';
import { Model, ModelStatic, Options, Sequelize } from 'sequelize';

export type DbConfig = Options & {};
export type DbConfigs = Record<string, DbConfig>;

export type DbModel<T extends {} = any> = ModelStatic<Model<T>> & { associate?: (db: Db) => void };

export type DbModels = Record<string, DbModel<any>>;
export type Db = {
    sequelize: SequelizeType;
    Sequelize: typeof Sequelize;
    [key: string]: DbModel<any> | SequelizeType | typeof Sequelize;
};
