import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import {Card, CardId, ListId} from '@mosaiq/terrazzo-common/types';

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

export const getCardById = async (id: CardId) => {
    return (await CardModel.findByPk(id))?.toJSON() as Card | null;
};

export const getCardsByListId = async (listId: ListId) => {
    return (await CardModel.findAll({ where: { listId } })).map(card => card.toJSON()) as Card[];
};

export const getCardsByListIdShortUp = async (listId: ListId, archived:boolean) => {
    return (await CardModel.findAll({
        where: { listId, archived },
        order: [['order', 'ASC']],
        attributes:{
            exclude:['description', 'updatedAt']
        }}))
        .map(card => card.toJSON()) as Card[];
};

export const createCardOnList = async (card: Card, listId: ListId) => {
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

export const updateName = async (cardId: CardId, name: string) => {
    return await CardModel.update({ name: name }, { where: { id: cardId } });
};

export const getCardsByListIdDown = async (listId: ListId) => {
    return (await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] })).map(card => card.toJSON()) as Card[];
};

export const getCardsByListIdUp = async (listId: string) => {
    return (await CardModel.findAll({ where: { listId }, order: [['order', 'ASC']] })).map(list => list.toJSON()) as Card[];
};

export const getNextCardOrder = async (listId: string) => {
    const cards = (await CardModel.findAll({ where: { listId }, order: [['order', 'DESC']] })).map(card => card.toJSON()) as Card[];
    return cards?.length ?? 0;
}

export const updateCardList = async (cardId:string, listId:string) => {
    return await CardModel.update({listId}, {where: { id: cardId}});
}

export const updateCardOrder = async (cardId:string, order:number) => {
    return await CardModel.update({order}, {where: { id: cardId}});
}