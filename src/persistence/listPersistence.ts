import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { List } from '@mosaiq/terrazzo-common/types';

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


export const getListById = async (id: string) => {
    return (await ListModel.findByPk(id))?.toJSON() as List | null;
}

export const getListsByBoardId = async (boardId: string) => {
    return (await ListModel.findAll({ where: { boardId } })).map(list => list.toJSON()) as List[];
}

export const getListsByBoardIdOrder = async (boardId: string) => {
    return (await ListModel.findAll({
        where: { boardId },
        order: [['order', 'ASC']],
        attributes:{
            exclude:['createdAt', 'updatedAt']
        }
    })).map(list => list.toJSON()) as List[];
}

export const getNextListOrder = async (boardId: string) => {
    const list = (await ListModel.findAll({ where: { boardId }, order: [['order', 'DESC']] })).map(list => list.toJSON()) as List[];
    return list ? list.length + 1 : 1;
}

export const createListOnBoard = async (list: List, boardId: string) => {
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

export const setListArchived = async (id: string, archived: boolean) => {
    return await ListModel.update({ archived }, { where: { id } });
}