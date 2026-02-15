import { CardHeader, CardId, ListId, ModuleId } from '@mosaiq/terrazzo-common';
import { CacheEntity, CardModel, getCached, invalidateCache, sequelize } from '@mosaiq/terrazzo-db';
import { Op } from 'sequelize';

export const getCardByIdDb = async (id: CardId) => {
    return await getCached(CacheEntity.Card, id, async () => {
        const model = await CardModel.findByPk(id);
        return model?.toJSON();
    });
};

export const getActiveCardIdsOnListDb = async (listId: ListId) => {
    return (
        (await getCached(CacheEntity.CardsInList, listId, async () => {
            const models = await CardModel.findAll({
                where: { listId, order: { [Op.not]: null } },
                order: [['order', 'ASC']],
            });
            return models.map((card) => card.toJSON().id);
        })) || []
    );
};

export const getActiveCardsByBoardIdDb = async (boardId: ModuleId) => {
    const models = await CardModel.findAll({ where: { boardId, order: { [Op.not]: null } } });
    return models.map((card) => card.toJSON());
};

export const createCardOnListDb = async (card: CardHeader) => {
    const model = await CardModel.create({ ...card });
    await invalidateCache(CacheEntity.CardsInList, card.listId);
    return model.toJSON();
};

/**
 * Updates a card in the database.
 * Does NOT handle moving the card between lists or changing its order, and thus will not update caches related to those operations.
 */
export const updateCardDb = async (cardId: CardId, card: Partial<CardHeader>) => {
    const [updated] = await CardModel.update({ ...card }, { where: { id: cardId } });
    await invalidateCache(CacheEntity.Card, cardId);
    return updated;
};

export const getCardCountOnListDb = async (listId: ListId) => {
    return await CardModel.count({ where: { listId, order: { [Op.not]: null } } });
};

/**
 * Gets the number of cards on a board, including archived cards.
 */
export const getTotalCardCountOnBoardDb = async (boardId: ModuleId) => {
    return await CardModel.count({ where: { boardId } });
};

export const moveCardDb = async (cardId: CardId, toPosition: number | undefined | null, toListId: ListId) => {
    const transaction = await sequelize.transaction();
    try {
        const cardModel = await CardModel.findByPk(cardId, { transaction });
        if (!cardModel) {
            throw new Error('Card not found ' + cardId);
        }
        const card = cardModel.toJSON();
        const currentPosition = card.order;
        const currentListId = card.listId;
        if (toPosition === undefined) {
            const cardCount = await CardModel.count({
                where: { listId: toListId, order: { [Op.not]: null } },
                transaction,
            });
            toPosition = cardCount;
        }
        if (toPosition !== null) {
            const targetCount = await CardModel.count({
                where: { listId: toListId, order: { [Op.not]: null } },
                transaction,
            });
            const maxIndex =
                toListId === currentListId && currentPosition !== null ? Math.max(targetCount - 1, 0) : targetCount;
            toPosition = Math.min(Math.max(toPosition, 0), maxIndex);
        }
        if (toListId === currentListId) {
            // Moving within the same list
            if (toPosition === null) {
                if (currentPosition !== null) {
                    // Archiving: shift everything after it up to close the gap
                    await CardModel.decrement('order', {
                        by: 1,
                        where: {
                            listId: currentListId,
                            order: {
                                [Op.not]: null,
                                [Op.gt]: currentPosition,
                            },
                        },
                        transaction,
                    });
                }
            } else if (currentPosition === null) {
                // Unarchiving into the list: make room at the target position
                await CardModel.increment('order', {
                    by: 1,
                    where: {
                        listId: currentListId,
                        order: {
                            [Op.not]: null,
                            [Op.gte]: toPosition,
                        },
                    },
                    transaction,
                });
            } else if (toPosition < currentPosition) {
                // If moving up the list, shift everything between where it was and now is down
                await CardModel.increment('order', {
                    by: 1,
                    where: {
                        listId: currentListId,
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
                await CardModel.decrement('order', {
                    by: 1,
                    where: {
                        listId: currentListId,
                        order: {
                            [Op.not]: null,
                            [Op.gt]: currentPosition,
                            [Op.lte]: toPosition,
                        },
                    },
                    transaction,
                });
            }
        } else {
            // Moving to a different list
            if (toPosition === null) {
                // We should not be moving to a new list and archiving at the same time
                throw new Error('Cannot move card to a new list and archive at the same time ' + cardId);
            }
            if (currentPosition !== null) {
                await CardModel.decrement('order', {
                    by: 1,
                    where: {
                        listId: currentListId,
                        order: {
                            [Op.not]: null,
                            [Op.gt]: currentPosition,
                        },
                    },
                    transaction,
                });
            }
            await CardModel.increment('order', {
                by: 1,
                where: {
                    listId: toListId,
                    order: {
                        [Op.not]: null,
                        [Op.gte]: toPosition,
                    },
                },
                transaction,
            });
        }
        await CardModel.update({ order: toPosition, listId: toListId }, { where: { id: cardId }, transaction });
        await transaction.commit();
        await invalidateCache(CacheEntity.Card, cardId);
        await invalidateCache(CacheEntity.CardsInList, currentListId);
        await invalidateCache(CacheEntity.CardsInList, toListId);
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
};
