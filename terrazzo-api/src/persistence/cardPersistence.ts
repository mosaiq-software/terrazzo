import { BoardId, CardHeader, CardId, ListId, TextBlockId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model, Op } from 'sequelize';

class CardModel extends Model<CardHeader> {}
CardModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        listId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        boardId: DataTypes.STRING,
        cardNumber: DataTypes.INTEGER,
        name: DataTypes.STRING,
        descriptionTextBlockId: DataTypes.STRING,
        priority: DataTypes.INTEGER,
        order: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        createdById: DataTypes.STRING,
        createdAt: DataTypes.NUMBER,
    },
    { sequelize, timestamps: false, tableName: 'Cards' }
);

export const getCardByIdDb = async (id: CardId) => {
    const model = await CardModel.findByPk(id);
    return model?.toJSON();
};

export const getActiveCardsByListIdUpDb = async (listId: ListId) => {
    const models = await CardModel.findAll({
        where: { listId, order: { [Op.not]: null } },
        order: [['order', 'ASC']],
    });
    return models.map((card) => card.toJSON());
};

export const getActiveCardsByBoardIdDb = async (boardId: BoardId) => {
    const models = await CardModel.findAll({ where: { boardId, order: { [Op.not]: null } } });
    return models.map((card) => card.toJSON());
};

export const createCardOnListDb = async (card: CardHeader) => {
    const model = await CardModel.create({ ...card });
    return model.toJSON();
};

export const updateCardDb = async (card: Partial<CardHeader>) => {
    const [updated] = await CardModel.update({ ...card }, { where: { id: card.id } });
    return updated;
};

export const getCardCountOnListDb = async (listId: ListId) => {
    return await CardModel.count({ where: { listId, order: { [Op.not]: null } } });
};

export const getCardsByDescriptionTextBlockIdDb = async (textBlockId: TextBlockId) => {
    const models = await CardModel.findAll({ where: { descriptionTextBlockId: textBlockId } });
    return models.map((card) => card.toJSON());
};

export const moveCardDb = async (cardId: CardId, toPosition: number | undefined, toListId: ListId) => {
    const transaction = await sequelize.transaction();
    try {
        if (toPosition === undefined) {
            const cardCount = await CardModel.count({
                where: { listId: toListId, order: { [Op.not]: null } },
                transaction,
            });
            toPosition = cardCount;
        }
        const cardModel = await CardModel.findByPk(cardId, { transaction });
        if (!cardModel) {
            throw new Error('Card not found ' + cardId);
        }
        const card = cardModel.toJSON();
        const currentPosition = card.order;
        if (currentPosition === null || currentPosition === undefined) {
            throw new Error('Card order is null ' + cardId);
        }
        const currentListId = card.listId;
        if (toListId === currentListId) {
            // Moving within the same list
            if (toPosition < currentPosition) {
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
            await CardModel.increment('order', {
                by: 1,
                where: {
                    listId: toListId,
                    order: {
                        [Op.not]: null,
                        [Op.gt]: toPosition - 1,
                    },
                },
                transaction,
            });
        }
        await CardModel.update({ order: toPosition, listId: toListId }, { where: { id: cardId }, transaction });
        await transaction.commit();
    } catch (e) {
        await transaction.rollback();
        throw e;
    }
};
