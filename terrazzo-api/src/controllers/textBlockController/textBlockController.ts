import { Block } from '@blocknote/core';
import {
    BLOCKNOTE_FRAGMENT_ID,
    exhaustiveCheck,
    TextBlockId,
    TextBlockResourceType,
    TextBlockType,
    UID,
    UserId,
} from '@mosaiq/terrazzo-common';
import { getCardByIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentByIdDb } from '@trz-api/persistence/documentPersistence';
import { createTextBlockDb, getTextBlockByIdDb, updateTextBlockDb } from '@trz-api/persistence/textBlockPersistence';
import { userCanEditCard, userCanEditDocument } from '@trz-api/utils/permissions';
import { Document } from '@trz-api/utils/y-socket-io';
import console from 'console';
import { Doc, XmlText } from 'yjs';
import { getBoardIDFromCardID } from '../cardController';
import { BLOCKNOTE_EDITOR } from './blocknote';
import { convertBlocknoteBlocksToPlaintext, maybeParseMarkdownToBlocks } from './blocknoteUtils';
import { createTextBlockHistorySnapshot, HISTORY_SNAPSHOT_INTERVAL_MS } from './historySnapshots';
import { getContentFromDoc } from './yjsUtils';

export const checkCanUserEditTextBlock = async (
    userId: UserId | undefined,
    resourceId: UID,
    resourceType: TextBlockResourceType
): Promise<TextBlockId | undefined> => {
    switch (resourceType) {
        case 'card': {
            const card = await getCardByIdDb(resourceId);
            if (!card) {
                return undefined;
            }
            const boardId = await getBoardIDFromCardID(card.id);
            if (!(await userCanEditCard(userId, boardId))) {
                return undefined;
            }
            return card.descriptionTextBlockId;
        }
        case 'document': {
            const document = await getDocumentByIdDb(resourceId);
            if (!document) {
                return undefined;
            }
            if (!(await userCanEditDocument(userId, document.id))) {
                return undefined;
            }
            return document.textBlockId;
        }
        default:
            return undefined;
    }
};

export const storeTextBlockEncodedData = async (doc: Document, forceSnapshot?: boolean): Promise<void> => {
    const { textBlockId, resourceId, resourceType } = doc;
    try {
        const textBlock = await getTextBlockByIdDb(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }

        const content = getContentFromDoc(doc, textBlock.type);
        const now = Date.now();
        if (
            textBlock.trackHistory &&
            ((textBlock.lastSnapshotAt !== undefined &&
                now - textBlock.lastSnapshotAt >= HISTORY_SNAPSHOT_INTERVAL_MS) ||
                forceSnapshot)
        ) {
            await updateTextBlockDb(textBlockId, { text: content, lastSnapshotAt: now });
            await createTextBlockHistorySnapshot(textBlockId, resourceId, resourceType, content);
        } else {
            await updateTextBlockDb(textBlockId, { text: content });
        }
    } catch (error: any) {
        console.error('Unable to save text block ' + textBlockId + ' : ' + error.message);
        throw error;
    }
};

export const loadTextBlockEncodedData = async (textBlockId: TextBlockId): Promise<Doc | null> => {
    try {
        const textBlock = await getTextBlockByIdDb(textBlockId);
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

export const createBlocknoteTextBlockWithBlocks = async (blocks: Block[]) => {
    try {
        const blocksJsonString = JSON.stringify(blocks);
        const tb = await createTextBlockDb({
            id: crypto.randomUUID(),
            text: blocksJsonString,
            type: TextBlockType.BlockNote,
            trackHistory: true,
        });
        return tb;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};

export const createBlocknoteTextBlockWithMarkdown = async (markdownText?: string) => {
    try {
        const blocks = await maybeParseMarkdownToBlocks(markdownText);
        const blocksJsonString = JSON.stringify(blocks);
        const tb = await createTextBlockDb({
            id: crypto.randomUUID(),
            text: blocksJsonString,
            type: TextBlockType.BlockNote,
            trackHistory: true,
        });
        return tb;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};

export const createPlainTextBlock = async (plainText: string) => {
    try {
        const tb = await createTextBlockDb({
            id: crypto.randomUUID(),
            text: plainText,
            type: TextBlockType.PlainText,
            trackHistory: true,
        });
        return tb;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};

/**
 * Gets the text content of a text block suitable for querying/indexing.
 * If the block is plain text, returns the text directly.
 * If the block is BlockNote, extracts the content from the stored blocks.
 */
export const getTextBlocksAsPlaintext = async (textBlockId: TextBlockId): Promise<string> => {
    try {
        const textBlock = await getTextBlockByIdDb(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }
        switch (textBlock.type) {
            case TextBlockType.PlainText:
                return textBlock.text;
            case TextBlockType.BlockNote: {
                let blocks: Block[] = [];
                if (textBlock.text && textBlock.text.length > 0) {
                    blocks = JSON.parse(textBlock.text);
                }
                return await convertBlocknoteBlocksToPlaintext(blocks);
            }
            default:
                return exhaustiveCheck(textBlock.type, `Unsupported text block type for text block ${textBlockId}`);
        }
    } catch (error: any) {
        console.error(`Unable to get queryable content for text block ${textBlockId}`, {
            message: error.message,
            trace: error.stack,
        });
        return '';
    }
};

/**
 * Retrieves the BlockNote blocks for a given text block ID.
 * If the text block is of type BlockNote, returns the blocks.
 * If the text block is of type PlainText, returns undefined.
 */
export const getTextBlockAsBlocks = async (textBlockId: TextBlockId): Promise<Block[] | undefined> => {
    try {
        const textBlock = await getTextBlockByIdDb(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }
        switch (textBlock.type) {
            case TextBlockType.BlockNote: {
                let blocks: Block[] = [];
                if (textBlock.text && textBlock.text.length > 0) {
                    blocks = JSON.parse(textBlock.text);
                }
                return blocks;
            }
            case TextBlockType.PlainText:
                return undefined;
            default:
                return exhaustiveCheck(textBlock.type, `Unsupported text block type for text block ${textBlockId}`);
        }
    } catch (error: any) {
        console.error(`Unable to get blocks for text block ${textBlockId}`, {
            message: error.message,
            trace: error.stack,
        });
        return undefined;
    }
};
