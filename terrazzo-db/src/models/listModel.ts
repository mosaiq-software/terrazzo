import { List } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type ListModelType = List;

export const getListModel = (sequelize: Sequelize): DbModel<ListModelType> => {
    class ListModel extends Model<ListModelType> {
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
