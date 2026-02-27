import { Label, LabelId, ModuleId } from '@mosaiq/terrazzo-common';
import { LabelModel } from '@mosaiq/terrazzo-db';

export const getLabelByIdDb = async (id: LabelId) => {
    const model = await LabelModel.findByPk(id);
    return model?.toJSON();
};

export const getLabelIdsByBoardIdDb = async (boardId: ModuleId) => {
    const models = await LabelModel.findAll({ where: { boardId } });
    return models.map((label) => label.toJSON().id);
};

export const createLabelOnBoardDb = async (label: Label, boardId: ModuleId) => {
    const model = await LabelModel.create({
        id: label.id,
        boardId,
        name: label.name,
        color: label.color,
    });
    return model.toJSON();
};

export const updateLabelDb = async (id: LabelId, update: Partial<Label>) => {
    const [updated] = await LabelModel.update({ ...update }, { where: { id } });
    return updated;
};
