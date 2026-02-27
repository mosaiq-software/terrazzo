import { ObjectSource, TextBlock } from '@mosaiq/terrazzo-common';
import { createTextBlockDb, getTextBlockByIdDb, updateTextBlockDb } from '@trz-api/persistence/textBlockPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const textBlockHandler = objectSourceHandlers(ObjectSource.TextBlock, {
    create: async (data) => {
        const textBlock: TextBlock = {
            id: crypto.randomUUID(),
            text: data.text,
            type: data.type,
            trackHistory: data.trackHistory,
        };
        await createTextBlockDb(textBlock);
        return textBlock.id;
    },
    update: async (id, data) => {
        await updateTextBlockDb(id, data);
    },
    read: async (id) => {
        return (await getTextBlockByIdDb(id)) || undefined;
    },
});
