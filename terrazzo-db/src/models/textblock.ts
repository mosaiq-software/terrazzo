import { TextBlock } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const getTextBlockModel = (sequelize: Sequelize): DbModel<TextBlock> => {
    class TextBlockModel extends Model<TextBlock> {
        static associate(db: Db) {
            // define association here
        }
    }
    TextBlockModel.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            text: DataTypes.TEXT,
            type: DataTypes.STRING,
            trackHistory: DataTypes.BOOLEAN,
            lastSnapshotAt: DataTypes.NUMBER,
        },
        { sequelize, timestamps: false, modelName: 'TextBlock' }
    );

    return TextBlockModel;
};
