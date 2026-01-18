import { BlockNoteSchema, defaultInlineContentSpecs } from '@blocknote/core';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { BlockNoteMention } from './mentions';

const BNSchema = BlockNoteSchema.create().extend({
    blockSpecs: {},
    inlineContentSpecs: {
        ...defaultInlineContentSpecs,
        mention: BlockNoteMention,
    },
});

export const BLOCKNOTE_EDITOR = ServerBlockNoteEditor.create({
    schema: BNSchema,
});
