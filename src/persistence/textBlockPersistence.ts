import { Model, DataTypes } from 'sequelize';
import { sequelize } from './dbHelper';
import { TextBlock, TextBlockId, UID } from '@mosaiq/terrazzo-common/types';

class TextBlockModel extends Model {}
TextBlockModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    parentId: DataTypes.STRING,
    text: DataTypes.TEXT
}, { sequelize, modelName: 'textBlockModel' });

sequelize.sync();

export const getTextBlockById = async (id: TextBlockId) => {
    return (await TextBlockModel.findByPk(id))?.toJSON() as TextBlock | null;
}

export const getTextBlockByParentId = async (parentId: UID) => {
    return (await TextBlockModel.findAll({ where: { parentId } })).map(block => block.toJSON()) as TextBlock[];
}

export const getAllTextBlockIds = async () => {
    return (await TextBlockModel.findAll({
        attributes: ['id']
    })).map((ret)=>ret.toJSON().id);
}

export const createTextBlock = async (text: string, parentId: UID) => {
    const uid = crypto.randomUUID();
    return (await TextBlockModel.create({
        id: uid,
        parentId,
        text,
    })).toJSON() as TextBlock;
}

export const writeTextBlock = async (id:TextBlockId, text:string) => {
    return await TextBlockModel.update({
        text
    }, { where: { id: id } });
}