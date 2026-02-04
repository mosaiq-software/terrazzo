import { BoardId, Label, LabelId } from '@mosaiq/terrazzo-common';
import { LabelModel } from '@mosaiq/terrazzo-db';

export const getLabelByIdDb = async (id: LabelId) => {
    const model = await LabelModel.findByPk(id);
    return model?.toJSON();
};

export const getLabelsByBoardIdDb = async (boardId: BoardId) => {
    const models = await LabelModel.findAll({ where: { boardId } });
    return models.map((label) => label.toJSON());
};

export const createLabelOnBoardDb = async (label: Label, boardId: BoardId) => {
    const model = await LabelModel.create({
        id: label.id,
        boardId,
        name: label.name,
        color: label.color,
    });
    return model.toJSON();
};

export const updateLabelDb = async (label: Label) => {
    const [updated] = await LabelModel.update(
        {
            name: label.name,
            color: label.color,
        },
        { where: { id: label.id } }
    );
    return updated;
};

export const deleteLabelDb = async (id: LabelId) => {
    const deleted = await LabelModel.destroy({ where: { id } });
    return deleted;
};

export const deleteLabelsByBoardIdDb = async (boardId: BoardId) => {
    const deleted = await LabelModel.destroy({ where: { boardId } });
    return deleted;
};
