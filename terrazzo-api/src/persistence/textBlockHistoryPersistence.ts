import { TextBlockHistorySnapshot, TextBlockId, UID } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class TextBlockHistoryModel extends Model<TextBlockHistorySnapshot> {}
TextBlockHistoryModel.init(
    {
        snapshotId: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        textBlockId: DataTypes.STRING,
        timestamp: DataTypes.NUMBER,
        diff: DataTypes.TEXT,
    },
    { sequelize, timestamps: false }
);

export const createTextBlockHistorySnapshotDb = async (snapshot: TextBlockHistorySnapshot) => {
    const model = await TextBlockHistoryModel.create({ ...snapshot });
    return model.toJSON();
};

export const getTextBlockHistorySnapshotDb = async (snapshotId: UID) => {
    const model = await TextBlockHistoryModel.findByPk(snapshotId);
    return model?.toJSON();
};

export const getTextBlockHistorySnapshotsForTextBlockDb = async (textBlockId: TextBlockId) => {
    const models = await TextBlockHistoryModel.findAll({ where: { textBlockId }, order: [['timestamp', 'DESC']] });
    return models.map((model) => model.toJSON());
};

export const deleteTextBlockHistorySnapshotDb = async (snapshotId: UID) => {
    const deleted = await TextBlockHistoryModel.destroy({ where: { snapshotId } });
    return deleted;
};
