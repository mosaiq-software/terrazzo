import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import {Card, List} from '@mosaiq/terrazzo-common/dist/types';

class CardModel extends Model {}
CardModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    listId: DataTypes.STRING,
    cardNumber: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    priority: DataTypes.INTEGER,
    storyPoints: DataTypes.INTEGER,
    sprintId: DataTypes.STRING,
    archived: DataTypes.BOOLEAN,
    order: DataTypes.INTEGER
}, { sequelize, modelName: 'cardModel' });

sequelize.sync();

export const getCardById = async (id: string) => {
    return (await CardModel.findByPk(id))?.toJSON() as Card | null;
};

export const getCardsByListId = async (listId: string) => {
    return (await CardModel.findAll({ where: { listId } })).map(card => card.toJSON()) as Card[];
};

export const createCardOnList = async (card: Card, listId: string) => {
    return await CardModel.create({
        id: card.id,
        listId,
        cardNumber: card.cardNumber,
        name: card.name,
        description: card.description,
        priority: card.priority,
        storyPoints: card.storyPoints,
        sprintId: card.sprintId,
        archived: false
    });
};

export const updateCard = async (card: Card) => {
    return await CardModel.update({
        cardNumber: card.cardNumber,
        name: card.name,
        description: card.description,
        priority: card.priority,
        storyPoints: card.storyPoints,
        sprintId: card.sprintId,
        archived: card.archived
    }, { where: { id: card.id } });
};

export const getCardsByBoardIdDown = async (listId: string) => {
    return (await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] })).map(list => list.toJSON()) as List[];
}

export const setCardArchived = async (id: string, archived: boolean) => {
    return await CardModel.update({ archived }, { where: { id } });
};