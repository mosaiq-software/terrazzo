import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { BoardId, CardId, Label, LabelId } from '@mosaiq/terrazzo-common/types';

class LabelModel extends Model {}
LabelModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    boardId: DataTypes.STRING,
    name: DataTypes.STRING,
    color: DataTypes.STRING
}, { sequelize, modelName: 'labelModel' });

class LabeledCardModel extends Model {}
LabeledCardModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    labelId: DataTypes.STRING,
    cardId: DataTypes.STRING,
}, { sequelize, modelName: 'labeledCardModel' });

sequelize.sync();

export const getLabelById = async (id: LabelId) => {
    return (await LabelModel.findByPk(id))?.toJSON() as Label | null;
}

export const getLabelsByBoardId = async (boardId: BoardId) => {
    return (await LabelModel.findAll({ where: { boardId } })).map(label => label.toJSON()) as Label[];
}

export const createLabelOnBoard = async (label: Label, boardId: BoardId) => {
    return await LabelModel.create({
        id: label.id,
        boardId,
        name: label.name,
        color: label.color
    });
}

export const updateLabel = async (label: Label) => {
    return await LabelModel.update({
        name: label.name,
        color: label.color
    }, { where: { id: label.id } });
}

export const deleteLabel = async (id: LabelId) => {
    return await LabelModel.destroy({ where: { id } });
}

export const deleteLabelsByBoardId = async (boardId: BoardId) => {
    return await LabelModel.destroy({ where: { boardId } });
}




export const getLabelsOnCard = async (cardId:CardId) => {
    return (await LabeledCardModel.findAll({ where: { cardId } })).map(label => label.toJSON().labelId) as LabelId[];
}

export const deleteLabelingOnCardsByLabelId = async (labelId:LabelId) => {
    return await LabeledCardModel.destroy({ where: { labelId } });
}

export const deleteLabelsOnCard = async (cardId:CardId) => {
    return await LabeledCardModel.destroy({ where: { cardId } });
}

export const addLabelToCard = async (labelId:LabelId, cardId:CardId) => {
    return await LabeledCardModel.create({
        id: crypto.randomUUID(),
        cardId,
        labelId
    });
}