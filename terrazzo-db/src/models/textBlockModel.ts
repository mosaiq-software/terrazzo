import { TextBlock } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type TextBlockModelType = TextBlock;

export const getTextBlockModel = (sequelize: Sequelize): DbModel<TextBlockModelType> => {
    class TextBlockModel extends Model<TextBlockModelType> {
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
