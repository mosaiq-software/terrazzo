import { Label } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const getLabelModel = (sequelize: Sequelize): DbModel<Label> => {
    class LabelModel extends Model<Label> {
        static associate(db: Db) {
            // define association here
        }
    }
    LabelModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            boardId: DataTypes.STRING,
            name: DataTypes.STRING,
            color: DataTypes.STRING,
        },
        { sequelize, timestamps: false, modelName: 'Label' }
    );

    return LabelModel;
};
