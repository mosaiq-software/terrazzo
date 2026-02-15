import { ListHeader, ListId, ModuleId } from '@mosaiq/terrazzo-common';
import { CacheEntity, ListModel, getCached, invalidateCache, sequelize } from '@mosaiq/terrazzo-db';
import { Op } from 'sequelize';

export const getListByIdDb = async (id: ListId) => {
    return await getCached(CacheEntity.List, id, async () => {
        const model = await ListModel.findByPk(id);
        return model?.toJSON();
    });
};

export const getActiveListIdsByBoardIdOrderDb = async (boardId: ModuleId) => {
    return (
        (await getCached(CacheEntity.ListsInBoard, boardId, async () => {
            const models = await ListModel.findAll({
                where: {
                    boardId,
                    order: {
                        [Op.not]: null,
                    },
                },
                order: [['order', 'ASC']],
            });
            return models.map((list) => list.toJSON().id);
        })) || []
    );
};

export const getActiveListCountOnBoard = async (boardId: ModuleId) => {
    return await ListModel.count({ where: { boardId, order: { [Op.not]: null } } });
};

export const createListOnBoardDb = async (list: ListHeader) => {
    const model = await ListModel.create({ ...list });
    await invalidateCache(CacheEntity.ListsInBoard, list.boardId);
    return model.toJSON();
};

/**
 * Updates a list in the database.
 * Does NOT handle moving the list or changing its order, and thus will not update caches related to those operations.
 */
export const updateListDb = async (id: ListId, update: Partial<ListHeader>) => {
    const [updated] = await ListModel.update({ ...update }, { where: { id: id } });
    await invalidateCache(CacheEntity.List, id);
    return updated;
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
        await invalidateCache(CacheEntity.List, listId);
        await invalidateCache(CacheEntity.ListsInBoard, boardId);
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
};
