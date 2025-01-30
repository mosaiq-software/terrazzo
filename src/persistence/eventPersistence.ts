import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { EventLog } from '@mosaiq/terrazzo-common/types';

class EventModel extends Model {}
EventModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    type: DataTypes.STRING,
    timestamp: DataTypes.DATE,
    userId: DataTypes.STRING,
    itemId: DataTypes.STRING,
    oldValue: DataTypes.JSON,
    newValue: DataTypes.JSON
}, { sequelize, modelName: 'eventModel' });

sequelize.sync();

export const getEventById = async (id: string) => {
    return (await EventModel.findByPk(id))?.toJSON() as EventLog | null;
}

export const getEventsByUserId = async (userId: string) => {
    return (await EventModel.findAll({ where: { userId } })).map(event => event.toJSON()) as EventLog[];
}

export const getEventsByItemId = async (itemId: string) => {
    return (await EventModel.findAll({ where: { itemId } })).map(event => event.toJSON()) as EventLog[];
}

export const createEvent = async (event: EventLog) => {
    return await EventModel.create({
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        userId: event.userId,
        itemId: event.itemId,
        oldValue: event.oldValue,
        newValue: event.newValue
    });
}

export const updateEvent = async (event: EventLog) => {
    return await EventModel.update({
        type: event.type,
        timestamp: event.timestamp,
        userId: event.userId,
        itemId: event.itemId,
        oldValue: event.oldValue,
        newValue: event.newValue
    }, { where: { id: event.id } });
}
