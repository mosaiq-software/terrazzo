import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import {Card} from '@mosaiq/terrazzo-common/types';

class CardModel extends Model {}
CardModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    listId: DataTypes.STRING,
    cardNumber: DataTypes.INTEGER,
    name: DataTypes.STRING,
    descriptionTextBlockId: DataTypes.STRING,
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

export const getCardsByListIdShort = async (listId: string) => {
    return (await CardModel.findAll({
        where: { listId },
        attributes:{
            exclude:['description', 'storyPoints', 'sprintId', 'archived', 'createdAt', 'updatedAt']
        }}))
        .map(card => card.toJSON()) as Card[];
};

export const createCardOnList = async (card: Card, listId: string) => {
    return await CardModel.create({
        id: card.id,
        listId,
        cardNumber: card.cardNumber,
        name: card.name,
        descriptionTextBlockId: card.descriptionTextBlockId,
        priority: card.priority,
        storyPoints: card.storyPoints,
        sprintId: card.sprintId,
        archived: false,
        order: card.order
    });
};

export const updateCard = async (card: Card) => {
    return await CardModel.update({
        cardNumber: card.cardNumber,
        name: card.name,
        descriptionTextBlockId: card.descriptionTextBlockId,
        priority: card.priority,
        storyPoints: card.storyPoints,
        sprintId: card.sprintId,
        archived: card.archived,
        order: card.order
    }, { where: { id: card.id } });
};

export const updateDescription = async (cardId: string, description: string) => {
    return await CardModel.update({ description: description }, { where: { id: cardId } });
};

export const updateName = async (cardId: string, name: string) => {
    return await CardModel.update({ name: name }, { where: { id: cardId } });
};

export const getCardsByListIdDown = async (listId: string) => {
    return (await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] })).map(list => list.toJSON()) as Card[];
};

export const setCardArchived = async (id: string, archived: boolean) => {
    return await CardModel.update({ archived }, { where: { id } });
};

export const getNextCardOrder = async (listId: string) => {
    const card = (await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] })).map(card => card.toJSON()) as Card[];
    return card ? card.length + 1 : 1;
}