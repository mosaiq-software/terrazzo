import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { Checklist, ChecklistItem } from '@mosaiq/terrazzo-common/dist/types';

class ChecklistModel extends Model {}
ChecklistModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    cardId: DataTypes.STRING,
    name: DataTypes.STRING,
    archived: DataTypes.BOOLEAN
}, { sequelize, modelName: 'checklistModel' });

class ChecklistItemModel extends Model {}
ChecklistItemModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    checklistId: DataTypes.STRING,
    name: DataTypes.STRING,
    checked: DataTypes.BOOLEAN
}, { sequelize, modelName: 'checklistItemModel' });

sequelize.sync();

export const getChecklistById = async (id: string) => {
    return (await ChecklistModel.findByPk(id))?.toJSON() as Checklist | null;
}

export const getChecklistsByCardId = async (cardId: string) => {
    return (await ChecklistModel.findAll({ where: { cardId } })).map(checklist => checklist.toJSON()) as Checklist[];
}

export const getChecklistItemById = async (id: string) => {
    return (await ChecklistItemModel.findByPk(id))?.toJSON() as ChecklistItem | null;
}

export const getChecklistItemsByChecklistId = async (checklistId: string) => {
    return (await ChecklistItemModel.findAll({ where: { checklistId } })).map(checklistItem => checklistItem.toJSON()) as ChecklistItem[];
}

export const createChecklistOnCard = async (checklist: Checklist, cardId: string) => {
    return await ChecklistModel.create({
        id: checklist.id,
        cardId,
        name: checklist.name,
        archived: false
    });
}

export const createChecklistItem = async (checklistItem: ChecklistItem, checklistId: string) => {
    return await ChecklistItemModel.create({
        id: checklistItem.id,
        checklistId,
        name: checklistItem.name,
        checked: checklistItem.checked
    });
}

export const updateChecklist = async (checklist: Checklist) => {
    return await ChecklistModel.update({
        name: checklist.name,
        archived: checklist.archived
    }, { where: { id: checklist.id } });
}

export const updateChecklistItem = async (checklistItem: ChecklistItem) => {
    return await ChecklistItemModel.update({
        name: checklistItem.name,
        checked: checklistItem.checked
    }, { where: { id: checklistItem.id } });
}

export const setChecklistArchived = async (id: string, archived: boolean) => {
    return await ChecklistModel.update({ archived }, { where: { id } });
}

export const setChecklistItemChecked = async (id: string, checked: boolean) => {
    return await ChecklistItemModel.update({ checked }, { where: { id } });
}