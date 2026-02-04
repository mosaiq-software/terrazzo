import { ListHeader } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const ListModel = (sequelize: Sequelize): DbModel => {
    class ListModel extends Model<ListHeader> {
        static associate(db: Db) {
            // define association here
        }
    }
    ListModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            boardId: DataTypes.STRING,
            name: DataTypes.STRING,
            order: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
        },
        { sequelize, timestamps: false, modelName: 'List' }
    );

    return ListModel;
};
