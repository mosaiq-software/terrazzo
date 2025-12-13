import { TextBlock, TextBlockId } from '@mosaiq/terrazzo-common';
import { sequelize } from '@trz-api/utils/dbHelper';
import { DataTypes, Model } from 'sequelize';

class TextBlockModel extends Model<TextBlock> {}
TextBlockModel.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        text: DataTypes.TEXT,
    },
    { sequelize, timestamps: false }
);

export const getTextBlockByIdDb = async (id: TextBlockId) => {
    const model = await TextBlockModel.findByPk(id);
    return model?.toJSON();
};

export const createTextBlockDb = async (text?: string) => {
    const uid = crypto.randomUUID();
    const model = await TextBlockModel.create({
        id: uid,
        text: text ?? '',
    });
    return model.toJSON();
};

export const writeTextBlockDb = async (id: TextBlockId, text: string) => {
    const [updated] = await TextBlockModel.update(
        {
            text,
        },
        { where: { id: id } }
    );
    return updated;
};
