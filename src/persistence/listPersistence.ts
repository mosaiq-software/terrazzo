import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { List } from '@mosaiq/terrazzo-common/dist/types';

class ListModel extends Model {}
ListModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    boardId: DataTypes.STRING,
    name: DataTypes.STRING,
    archived: DataTypes.BOOLEAN
}, { sequelize, modelName: 'listModel' });

sequelize.sync();


export const getListById = async (id: string) => {
    return (await ListModel.findByPk(id))?.toJSON() as List | null;
}

export const getListsByBoardId = async (boardId: string) => {
    return (await ListModel.findAll({ where: { boardId } })).map(list => list.toJSON()) as List[];
}

export const createListOnBoard = async (list: List, boardId: string) => {
    return await ListModel.create({
        id: list.id,
        boardId,
        name: list.name,
        archived: false
    });
}

export const updateList = async (list: List) => {
    return await ListModel.update({
        name: list.name,
        archived: list.archived
    }, { where: { id: list.id } });
}

export const setListArchived = async (id: string, archived: boolean) => {
    return await ListModel.update({ archived }, { where: { id } });
}