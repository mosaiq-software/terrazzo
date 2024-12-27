import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { Label } from '@mosaiq/terrazzo-common/dist/types';

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

sequelize.sync();

export const getLabelById = async (id: string) => {
    return (await LabelModel.findByPk(id))?.toJSON() as Label | null;
}

export const getLabelsByBoardId = async (boardId: string) => {
    return (await LabelModel.findAll({ where: { boardId } })).map(label => label.toJSON()) as Label[];
}

export const createLabelOnBoard = async (label: Label, boardId: string) => {
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

export const deleteLabel = async (id: string) => {
    return await LabelModel.destroy({ where: { id } });
}

export const deleteLabelsByBoardId = async (boardId: string) => {
    return await LabelModel.destroy({ where: { boardId } });
}