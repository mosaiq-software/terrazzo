import { TextBlockSnapshot } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export type TextBlockHistoryModelType = TextBlockSnapshot;

export const getTextBlockHistoryModel = (sequelize: Sequelize): DbModel<TextBlockHistoryModelType> => {
    class TextBlockHistoryModel extends Model<TextBlockHistoryModelType> {
        static associate(db: Db) {
            // define association here
        }
    }
    TextBlockHistoryModel.init(
        {
            snapshotId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            textBlockId: DataTypes.STRING,
            timestamp: DataTypes.NUMBER,
            content: DataTypes.TEXT,
            tags: DataTypes.JSON,
        },
        { sequelize, timestamps: false, modelName: 'TextBlockHistory' }
    );

    return TextBlockHistoryModel;
};
