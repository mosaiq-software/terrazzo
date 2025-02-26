import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { BoardId, List, ListId } from '@mosaiq/terrazzo-common/types';

class ListModel extends Model {}
ListModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    boardId: DataTypes.STRING,
    name: DataTypes.STRING,
    archived: DataTypes.BOOLEAN,
    order: DataTypes.INTEGER
}, { sequelize, modelName: 'listModel' });

sequelize.sync();


export const getListById = async (id: ListId) => {
    return (await ListModel.findByPk(id))?.toJSON() as List | null;
}

export const getListsByBoardId = async (boardId: BoardId) => {
    return (await ListModel.findAll({ where: { boardId } })).map(list => list.toJSON()) as List[];
}

export const getListsByBoardIdOrder = async (boardId: BoardId) => {
    return (await ListModel.findAll({
        where: { boardId },
        order: [['order', 'ASC']],
        attributes:{
            exclude:['createdAt', 'updatedAt']
        }
    })).map(list => list.toJSON()) as List[];
}

export const getNextListOrder = async (boardId: BoardId) => {
    const list = (await ListModel.findAll({ where: { boardId }, order: [['order', 'DESC']] })).map(list => list.toJSON()) as List[];
    return list ? list.length : 0;
}

export const createListOnBoard = async (list: List, boardId: BoardId) => {
    return await ListModel.create({
        id: list.id,
        boardId,
        name: list.name,
        archived: false,
        order: list.order
    });
}

export const updateList = async (list: List) => {
    return await ListModel.update({
        name: list.name,
        archived: list.archived,
        order: list.order
    }, { where: { id: list.id } });
}

export const getListsBoardId = async (listId: string) => {
    return ((await ListModel.findByPk(listId))?.toJSON() as List).boardId ?? null;
}

export const updateListOrder = async (lists: List[]) => {
    for (let i = 0; i < lists.length; i++){
        await ListModel.update({
            order: i,
        }, { where: { id: lists[i].id } });
    }
}