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
        type: DataTypes.STRING,
        trackHistory: DataTypes.BOOLEAN,
        lastSnapshotAt: DataTypes.NUMBER,
    },
    { sequelize, timestamps: false, tableName: 'TextBlocks' }
);

export const getTextBlockByIdDb = async (id: TextBlockId) => {
    const model = await TextBlockModel.findByPk(id);
    return model?.toJSON();
};

export const createTextBlockDb = async (textBlock: TextBlock) => {
    const model = await TextBlockModel.create({ ...textBlock });
    return model.toJSON();
};

export const updateTextBlockDb = async (id: TextBlockId, update: Partial<TextBlock>) => {
    const [updated] = await TextBlockModel.update({ ...update }, { where: { id: id } });
    return updated;
};
