import { TextBlock, TextBlockId } from '@mosaiq/terrazzo-common';
import { CacheEntity, TextBlockModel, getCached, invalidateCache } from '@mosaiq/terrazzo-db';

export const getTextBlockByIdDb = async (id: TextBlockId) => {
    return await getCached(CacheEntity.TextBlock, id, async () => {
        const model = await TextBlockModel.findByPk(id);
        return model?.toJSON();
    });
};

export const createTextBlockDb = async (textBlock: TextBlock) => {
    const model = await TextBlockModel.create({ ...textBlock });
    return model.toJSON();
};

export const updateTextBlockDb = async (id: TextBlockId, update: Partial<TextBlock>) => {
    const [updated] = await TextBlockModel.update({ ...update }, { where: { id: id } });
    await invalidateCache(CacheEntity.TextBlock, id);
    return updated;
};
