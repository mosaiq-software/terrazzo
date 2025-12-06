import { CardHeader, CardId, ListId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

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
    const model = await CardModel.findByPk(id);
    return model?.toJSON();
};

export const getCardsByListId = async (listId: ListId) => {
    const models = await CardModel.findAll({ where: { listId } });
    return models.map((card) => card.toJSON());
};

export const getCardsByListIdShortUp = async (listId: ListId, archived: boolean) => {
    const models = await CardModel.findAll({
        where: { listId, archived },
        order: [['order', 'ASC']],
        attributes: {
            exclude: ['description', 'updatedAt'],
        },
    });
    return models.map((card) => card.toJSON());
};

export const createCardOnList = async (card: CardHeader, listId: ListId) => {
    const model = await CardModel.create({
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
    return model.toJSON();
};

export const updateCard = async (card: CardHeader) => {
    const [updated] = await CardModel.update(
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
    return updated;
};

export const updateName = async (cardId: CardId, name: string) => {
    const [updated] = await CardModel.update({ name: name }, { where: { id: cardId } });
    return updated;
};

export const getCardsByListIdDown = async (listId: ListId) => {
    const models = await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] });
    return models.map((card) => card.toJSON());
};

export const getCardsByListIdUp = async (listId: ListId) => {
    const models = await CardModel.findAll({ where: { listId }, order: [['order', 'ASC']] });
    return models.map((list) => list.toJSON());
};

export const getNextCardOrder = async (listId: ListId) => {
    const models = await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] });
    const cards = models.map((card) => card.toJSON());
    return cards?.length ?? 0;
};

export const updateCardList = async (cardId: CardId, listId: ListId) => {
    const [updated] = await CardModel.update({ listId }, { where: { id: cardId } });
    return updated;
};

export const updateCardOrder = async (cardId: CardId, order: number) => {
    const [updated] = await CardModel.update({ order }, { where: { id: cardId } });
    return updated;
};
