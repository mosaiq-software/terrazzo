import { BoardId, CardHeader, CardId, ListId, TextBlockId } from '@mosaiq/terrazzo-common';
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
        boardId: DataTypes.STRING,
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

export const getCardByIdDb = async (id: CardId) => {
    const model = await CardModel.findByPk(id);
    return model?.toJSON();
};

export const getCardsByListIdShortUpDb = async (listId: ListId, archived: boolean) => {
    const models = await CardModel.findAll({
        where: { listId, archived },
        order: [['order', 'ASC']],
        attributes: {
            exclude: ['description', 'updatedAt'],
        },
    });
    return models.map((card) => card.toJSON());
};

export const getCardsByBoardIdDb = async (boardId: BoardId, options: Partial<CardHeader>) => {
    const models = await CardModel.findAll({ where: { boardId, ...options } });
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

export const getCardsByListIdDownDb = async (listId: ListId) => {
    const models = await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] });
    return models.map((card) => card.toJSON());
};

export const getCardsByDescriptionTextBlockIdDb = async (textBlockId: TextBlockId) => {
    const models = await CardModel.findAll({ where: { descriptionTextBlockId: textBlockId } });
    return models.map((card) => card.toJSON());
};

export const updateCardListDb = async (cardId: CardId, listId: ListId) => {
    const [updated] = await CardModel.update({ listId }, { where: { id: cardId } });
    return updated;
};

export const updateCardOrderDb = async (cardId: CardId, order: number) => {
    const [updated] = await CardModel.update({ order }, { where: { id: cardId } });
    return updated;
};
