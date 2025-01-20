import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { TimesheetEntry } from '@mosaiq/terrazzo-common/dist/types';

class TimeSheetModel extends Model {}
TimeSheetModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    startedAt: DataTypes.DATE,
    endedAt: DataTypes.DATE,
    description: DataTypes.STRING,
    userId: DataTypes.STRING,
    cardId: DataTypes.STRING,
    archived: DataTypes.BOOLEAN
}, { sequelize, modelName: 'timesheetModel' });

sequelize.sync();

export const getTimesheetEntryById = async (id: string) => {
    return (await TimeSheetModel.findByPk(id))?.toJSON() as TimesheetEntry | null;
}

export const getTimesheetEntriesByUserId = async (userId: string) => {
    return (await TimeSheetModel.findAll({ where: { userId } })).map(entry => entry.toJSON()) as TimesheetEntry[];
}

export const getTimesheetEntriesByCardId = async (cardId: string) => {
    return (await TimeSheetModel.findAll({ where: { cardId } })).map(entry => entry.toJSON()) as TimesheetEntry[];
}

export const createTimesheetEntry = async (entry: TimesheetEntry) => {
    return await TimeSheetModel.create({
        id: entry.id,
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
        description: entry.description,
        userId: entry.userId,
        cardId: entry.cardId,
        archived: false
    });
}

export const updateTimesheetEntry = async (entry: TimesheetEntry) => {
    return await TimeSheetModel.update({
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
        description: entry.description,
        archived: entry.archived
    }, { where: { id: entry.id } });
}

export const setTimesheetEntryArchived = async (id: string, archived: boolean) => {
    return await TimeSheetModel.update({ archived }, { where: { id } });
}