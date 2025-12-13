import { BoardId, ListHeader, ListId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class ListModel extends Model<ListHeader> {}
ListModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        boardId: DataTypes.STRING,
        name: DataTypes.STRING,
        archived: DataTypes.BOOLEAN,
        order: DataTypes.INTEGER,
    },
    { sequelize, timestamps: false }
);

export const getListByIdDb = async (id: ListId) => {
    const model = await ListModel.findByPk(id);
    return model?.toJSON();
};

export const getListsByBoardIdDb = async (boardId: BoardId) => {
    const models = await ListModel.findAll({ where: { boardId } });
    return models.map((list) => list.toJSON());
};

export const getListsByBoardIdOrderDb = async (boardId: BoardId, archived: boolean) => {
    const models = await ListModel.findAll({
        where: { boardId, archived },
        order: [['order', 'ASC']],
    });
    return models.map((list) => list.toJSON());
};

export const getNextListOrderDb = async (boardId: BoardId) => {
    const models = await ListModel.findAll({ where: { boardId }, order: [['order', 'DESC']] });
    const list = models.map((list) => list.toJSON());
    return list ? list.length : 0;
};

export const createListOnBoardDb = async (list: ListHeader, boardId: BoardId) => {
    const model = await ListModel.create({
        id: list.id,
        boardId,
        name: list.name,
        archived: false,
        order: list.order,
    });
    return model.toJSON();
};

export const updateListDb = async (list: ListHeader) => {
    const [updated] = await ListModel.update(
        {
            name: list.name,
            archived: list.archived,
            order: list.order,
        },
        { where: { id: list.id } }
    );
    return updated;
};

export const getListsBoardIdDb = async (listId: ListId) => {
    const model = await ListModel.findByPk(listId);
    const list = model?.toJSON();
    return list?.boardId ?? null;
};

export const updateListOrderDb = async (lists: ListHeader[]) => {
    for (let i = 0; i < lists.length; i++) {
        await ListModel.update(
            {
                order: i,
            },
            { where: { id: lists[i].id } }
        );
    }
};
