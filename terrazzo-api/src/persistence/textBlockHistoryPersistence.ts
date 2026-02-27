import { TextBlockId, TextBlockSnapshot, UID } from '@mosaiq/terrazzo-common';
import { TextBlockHistoryModel } from '@mosaiq/terrazzo-db';

export const createTextBlockHistorySnapshotDb = async (snapshot: TextBlockSnapshot) => {
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

export const updateTextBlockHistorySnapshotDb = async (snapshotId: UID, update: Partial<TextBlockSnapshot>) => {
    const [updated] = await TextBlockHistoryModel.update({ ...update }, { where: { snapshotId } });
    return updated;
};

export const deleteTextBlockHistorySnapshotDb = async (snapshotId: UID) => {
    const deleted = await TextBlockHistoryModel.destroy({ where: { snapshotId } });
    return deleted;
};
