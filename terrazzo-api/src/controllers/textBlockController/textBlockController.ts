import { Block } from '@blocknote/core';
import {
    exhaustiveCheck,
    isModuleType,
    TextBlockId,
    TextBlockResourceType,
    TextBlockType,
    TrzModule,
    UID,
    UserId,
} from '@mosaiq/terrazzo-common';
import { userCanManageCards, userCanManageModule } from '@trz-api/utils/permissions';
import { Document } from '@trz-api/utils/y-socket-io/document';
import console from 'console';
import { getBoardIDFromCardID } from '../cardQueries';
import { cardHandler } from '../dataSources/objectHandlers/card';
import { moduleHandler } from '../dataSources/objectHandlers/module';
import { textBlockHandler } from '../dataSources/objectHandlers/textBlock';
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
            const card = await cardHandler.read(resourceId);
            if (!card) {
                return undefined;
            }
            const boardId = await getBoardIDFromCardID(card.id);
            if (!(await userCanManageCards(userId, boardId))) {
                return undefined;
            }
            return card.descriptionTextBlockId;
        }
        case 'document': {
            const module = await moduleHandler.read(resourceId);
            if (!module || !isModuleType(module, TrzModule.Document)) {
                return undefined;
            }
            if (!(await userCanManageModule(userId, module.id))) {
                return undefined;
            }
            return module.data.textBlockId;
        }
        default:
            return undefined;
    }
};

export const storeTextBlockEncodedData = async (doc: Document, forceSnapshot?: boolean): Promise<void> => {
    const { textBlockId, resourceId, resourceType } = doc;
    try {
        const textBlock = await textBlockHandler.read(textBlockId);
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
            await textBlockHandler.update(textBlockId, { text: content, lastSnapshotAt: now }, { preventSync: true });
            await createTextBlockHistorySnapshot(textBlockId, resourceId, resourceType, content);
        } else {
            await textBlockHandler.update(textBlockId, { text: content }, { preventSync: true });
        }
    } catch (error: any) {
        console.error('Unable to save text block ' + textBlockId + ' : ' + error.message);
        throw error;
    }
};

export const createBlocknoteTextBlockWithBlocks = async (blocks: Block[]) => {
    try {
        const blocksJsonString = JSON.stringify(blocks);
        const textBlockId = await textBlockHandler.create(
            {
                text: blocksJsonString,
                type: TextBlockType.BlockNote,
                trackHistory: true,
            },
            { preventSync: true }
        );
        const tb = await textBlockHandler.read(textBlockId);
        return tb || null;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};

export const createBlocknoteTextBlockWithMarkdown = async (markdownText?: string) => {
    try {
        const blocks = await maybeParseMarkdownToBlocks(markdownText);
        const blocksJsonString = JSON.stringify(blocks);
        const textBlockId = await textBlockHandler.create(
            {
                text: blocksJsonString,
                type: TextBlockType.BlockNote,
                trackHistory: true,
            },
            { preventSync: true }
        );
        const tb = await textBlockHandler.read(textBlockId);
        return tb || null;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};

export const createPlainTextBlock = async (plainText: string) => {
    try {
        const textBlockId = await textBlockHandler.create(
            {
                text: plainText,
                type: TextBlockType.PlainText,
                trackHistory: true,
            },
            { preventSync: true }
        );
        const tb = await textBlockHandler.read(textBlockId);
        return tb || null;
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
        const textBlock = await textBlockHandler.read(textBlockId);
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
        const textBlock = await textBlockHandler.read(textBlockId);
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
