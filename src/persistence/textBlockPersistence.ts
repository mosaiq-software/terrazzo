import { Model, DataTypes } from 'sequelize';
import { sequelize } from '@trz-api/utils/dbHelper';
import { TextBlock, TextBlockId } from '@mosaiq/terrazzo-common/types';

class TextBlockModel extends Model {}
TextBlockModel.init({
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    text: DataTypes.TEXT
}, { sequelize});


export const getTextBlockById = async (id: TextBlockId) => {
    return (await TextBlockModel.findByPk(id))?.toJSON() as TextBlock | null;
}

export const getAllTextBlockIds = async () => {
    return (await TextBlockModel.findAll({
        attributes: ['id']
    })).map((ret)=>ret.toJSON().id);
}

export const createTextBlock = async (text?: string) => {
    const uid = crypto.randomUUID();
    return (await TextBlockModel.create({
        id: uid,
        text: text ?? '',
    })).toJSON() as TextBlock;
}

export const writeTextBlock = async (id:TextBlockId, text:string) => {
    return await TextBlockModel.update({
        text
    }, { where: { id: id } });
}