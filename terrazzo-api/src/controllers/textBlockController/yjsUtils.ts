import { BLOCKNOTE_FRAGMENT_ID, exhaustiveCheck, TextBlockType } from '@mosaiq/terrazzo-common';
import { Document } from '@trz-api/utils/y-socket-io/document';
import { XmlText } from 'yjs';
import { BLOCKNOTE_EDITOR } from './blocknote';

export const getContentFromDoc = (doc: Document, type: TextBlockType): string => {
    const fragment = doc.getXmlFragment(BLOCKNOTE_FRAGMENT_ID);
    switch (type) {
        case TextBlockType.PlainText: {
            const textElements = fragment.toArray().filter((item) => item instanceof XmlText);
            return textElements.map((te) => te.toString()).join('\n');
        }
        case TextBlockType.BlockNote: {
            const blocks = BLOCKNOTE_EDITOR.yXmlFragmentToBlocks(fragment);
            return JSON.stringify(blocks);
        }
        default:
            return exhaustiveCheck(type, `Unsupported text block type for content extraction`);
    }
};
