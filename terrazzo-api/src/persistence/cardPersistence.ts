import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@trz-api/utils/dbHelper';
import { Card, CardHeader, CardId, ListId } from '@mosaiq/terrazzo-common/types';

class CardModel extends Model {}
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
        cardNumber: DataTypes.INTEGER,
        name: DataTypes.STRING,
        descriptionTextBlockId: DataTypes.STRING,
        priority: DataTypes.INTEGER,
        storyPoints: DataTypes.INTEGER,
        archived: DataTypes.BOOLEAN,
        order: DataTypes.INTEGER,
        createdById: DataTypes.STRING,
        createdAt: DataTypes.NUMBER,
    },
    { sequelize, timestamps: false }
);

export const getCardById = async (id: CardId) => {
    return (await CardModel.findByPk(id))?.toJSON() as CardHeader | null;
};

export const getCardsByListId = async (listId: ListId) => {
    return (await CardModel.findAll({ where: { listId } })).map((card) => card.toJSON()) as CardHeader[];
};

export const getCardsByListIdShortUp = async (listId: ListId, archived: boolean) => {
    return (
        await CardModel.findAll({
            where: { listId, archived },
            order: [['order', 'ASC']],
            attributes: {
                exclude: ['description', 'updatedAt'],
            },
        })
    ).map((card) => card.toJSON()) as CardHeader[];
};

export const createCardOnList = async (card: CardHeader, listId: ListId) => {
    return await CardModel.create({
        id: card.id,
        listId,
        cardNumber: card.cardNumber,
        name: card.name,
        descriptionTextBlockId: card.descriptionTextBlockId,
        priority: card.priority,
        storyPoints: card.storyPoints,
        archived: false,
        order: card.order,
        createdById: card.createdById,
        createdAt: card.createdAt,
    });
};

export const updateCard = async (card: CardHeader) => {
    return await CardModel.update(
        {
            cardNumber: card.cardNumber,
            name: card.name,
            descriptionTextBlockId: card.descriptionTextBlockId,
            priority: card.priority,
            storyPoints: card.storyPoints,
            archived: card.archived,
            order: card.order,
        },
        { where: { id: card.id } }
    );
};

export const updateName = async (cardId: CardId, name: string) => {
    return await CardModel.update({ name: name }, { where: { id: cardId } });
};

export const getCardsByListIdDown = async (listId: ListId) => {
    return (await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] })).map((card) => card.toJSON()) as CardHeader[];
};

export const getCardsByListIdUp = async (listId: ListId) => {
    return (await CardModel.findAll({ where: { listId }, order: [['order', 'ASC']] })).map((list) => list.toJSON()) as CardHeader[];
};

export const getNextCardOrder = async (listId: ListId) => {
    const cards = (await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] })).map((card) => card.toJSON()) as CardHeader[];
    return cards?.length ?? 0;
};

export const updateCardList = async (cardId: CardId, listId: ListId) => {
    return await CardModel.update({ listId }, { where: { id: cardId } });
};

export const updateCardOrder = async (cardId: CardId, order: number) => {
    return await CardModel.update({ order }, { where: { id: cardId } });
};
