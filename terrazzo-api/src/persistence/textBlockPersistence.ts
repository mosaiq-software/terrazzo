import { TextBlock, TextBlockId } from '@mosaiq/terrazzo-common';
import { TextBlockModel } from '@mosaiq/terrazzo-db';

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
