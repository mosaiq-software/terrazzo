import { TextBlockSnapshot } from '@mosaiq/terrazzo-common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { Db, DbModel } from '../dbTypes';

export const TextBlockHistoryModel = (sequelize: Sequelize): DbModel => {
    class TextBlockHistoryModel extends Model<TextBlockSnapshot> {
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
