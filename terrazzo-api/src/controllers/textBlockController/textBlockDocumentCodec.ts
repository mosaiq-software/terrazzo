import { Block } from '@blocknote/core';
import { BLOCKNOTE_FRAGMENT_ID, TextBlockId, TextBlockType, exhaustiveCheck } from '@mosaiq/terrazzo-common';
import { Doc, XmlText } from 'yjs';
import { textBlockHandler } from '../dataSources/objectHandlers/textBlock';
import { BLOCKNOTE_EDITOR } from './blocknote';
import { maybeParseMarkdownToBlocks } from './blocknoteUtils';

export const loadTextBlockEncodedData = async (textBlockId: TextBlockId): Promise<Doc | null> => {
    try {
        const textBlock = await textBlockHandler.read(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }

        switch (textBlock.type) {
            case TextBlockType.BlockNote: {
                let blocks: Block[] = [];
                if (textBlock.text && textBlock.text.length > 0) {
                    try {
                        blocks = JSON.parse(textBlock.text);
                    } catch (e: any) {
                        console.warn(`Failed to parse text block data for text block ${textBlockId}`, {
                            error: e,
                            textData: textBlock.text,
                        });
                        const blocksFromMarkdown = await maybeParseMarkdownToBlocks(textBlock.text);
                        blocks = blocksFromMarkdown;
                    }
                }
                return BLOCKNOTE_EDITOR.blocksToYDoc(blocks, BLOCKNOTE_FRAGMENT_ID);
            }
            case TextBlockType.PlainText: {
                const ydoc = new Doc();
                const fragment = ydoc.getXmlFragment(BLOCKNOTE_FRAGMENT_ID);
                const textElement = new XmlText();
                if (textBlock.text) {
                    textElement.insert(0, textBlock.text);
                }
                fragment.insert(0, [textElement]);
                return ydoc;
            }
            default:
                return exhaustiveCheck(textBlock.type, `Unsupported text block type for text block ${textBlockId}`);
        }
    } catch (error: any) {
        console.error(`Unable to load text block ${textBlockId}`, {
            message: error.message,
            trace: error.stack,
        });
        return null;
    }
};
