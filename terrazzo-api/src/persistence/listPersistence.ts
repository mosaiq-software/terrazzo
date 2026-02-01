import { BoardId, ListHeader, ListId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model, Op } from 'sequelize';

class ListModel extends Model<ListHeader> {}
ListModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        boardId: DataTypes.STRING,
        name: DataTypes.STRING,
        order: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    { sequelize, timestamps: false, tableName: 'Lists' }
);

export const getListByIdDb = async (id: ListId) => {
    const model = await ListModel.findByPk(id);
    return model?.toJSON();
};

export const getListsByBoardIdDb = async (boardId: BoardId) => {
    const models = await ListModel.findAll({ where: { boardId } });
    return models.map((list) => list.toJSON());
};

export const getActiveListsByBoardIdOrderDb = async (boardId: BoardId) => {
    const models = await ListModel.findAll({
        where: {
            boardId,
            order: {
                [Op.not]: null,
            },
        },
        order: [['order', 'ASC']],
    });
    return models.map((list) => list.toJSON());
};

export const getActiveListCountOnBoard = async (boardId: BoardId) => {
    return await ListModel.count({ where: { boardId, order: { [Op.not]: null } } });
};

export const createListOnBoardDb = async (list: ListHeader) => {
    const model = await ListModel.create({ ...list });
    return model.toJSON();
};

export const updateListDb = async (id: ListId, update: Partial<ListHeader>) => {
    const [updated] = await ListModel.update({ ...update }, { where: { id: id } });
    return updated;
};

export const getListsBoardIdDb = async (listId: ListId) => {
    const model = await ListModel.findByPk(listId);
    const list = model?.toJSON();
    return list?.boardId ?? null;
};

export const moveListDb = async (listId: ListId, toPosition: number | null) => {
    const transaction = await sequelize.transaction();
    try {
        const listModel = await ListModel.findByPk(listId, { transaction });
        if (!listModel) {
            throw new Error('List not found ' + listId);
        }
        const list = listModel.toJSON();
        const boardId = list.boardId;
        const currentPosition = list.order;

        // If toPosition is not null, clamp it within valid range
        if (toPosition !== null) {
            const activeCount = await ListModel.count({
                where: { boardId, order: { [Op.not]: null } },
                transaction,
            });
            const maxIndex = currentPosition !== null ? Math.max(activeCount - 1, 0) : activeCount;
            toPosition = Math.min(Math.max(toPosition, 0), maxIndex);
        }

        if (toPosition === null) {
            if (currentPosition !== null) {
                // Archiving: shift everything after it up to close the gap
                await ListModel.decrement('order', {
                    by: 1,
                    where: {
                        boardId,
                        order: {
                            [Op.not]: null,
                            [Op.gt]: currentPosition,
                        },
                    },
                    transaction,
                });
            }
        } else if (currentPosition === null) {
            // Unarchiving: make room at the target position
            await ListModel.increment('order', {
                by: 1,
                where: {
                    boardId,
                    order: {
                        [Op.not]: null,
                        [Op.gte]: toPosition,
                    },
                },
                transaction,
            });
        } else if (toPosition < currentPosition) {
            // If moving up the list, shift everything between where it was and now is down
            await ListModel.increment('order', {
                by: 1,
                where: {
                    boardId,
                    order: {
                        [Op.not]: null,
                        [Op.gt]: toPosition - 1,
                        [Op.lte]: currentPosition,
                    },
                },
                transaction,
            });
        } else if (toPosition > currentPosition) {
            // If moving down the list, shift everything between where it was and now is up
            await ListModel.decrement('order', {
                by: 1,
                where: {
                    boardId,
                    order: {
                        [Op.not]: null,
                        [Op.gt]: currentPosition,
                        [Op.lte]: toPosition,
                    },
                },
                transaction,
            });
        }

        await ListModel.update({ order: toPosition }, { where: { id: listId }, transaction });
        await transaction.commit();
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
};
