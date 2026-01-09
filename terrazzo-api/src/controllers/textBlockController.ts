import { Block } from '@blocknote/core';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { BLOCKNOTE_FRAGMENT_ID, TextBlockId, TextSocketHandshakeAuth, UID, UserId } from '@mosaiq/terrazzo-common';
import { getCardByIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentByIdDb } from '@trz-api/persistence/documentPersistence';
import { createTextBlockDb, getTextBlockByIdDb, writeTextBlockDb } from '@trz-api/persistence/textBlockPersistence';
import { userCanEditCard, userCanEditDocument } from '@trz-api/utils/permissions';
import console from 'console';
import { Doc } from 'yjs';
import { getBoardIDFromCardID } from './cardController';

export const checkCanUserEditTextBlock = async (userId: UserId | undefined, resourceId: UID, resourceType: TextSocketHandshakeAuth['resource']['type']): Promise<boolean> => {
    switch (resourceType) {
        case 'card': {
            const card = await getCardByIdDb(resourceId);
            if (!card) {
                return false;
            }
            const boardId = await getBoardIDFromCardID(card.id);
            if (!(await userCanEditCard(userId, boardId))) {
                return false;
            }
            return true;
        }
        case 'document': {
            const document = await getDocumentByIdDb(resourceId);
            if (!document) {
                return false;
            }
            if (!(await userCanEditDocument(userId, document.id))) {
                return false;
            }
            return true;
        }
        default:
            return false;
    }
};

const BLOCKNOTE_EDITOR = ServerBlockNoteEditor.create();

export const storeTextBlockEncodedData = async (textBlockId: TextBlockId, ydoc: Doc): Promise<void> => {
    try {
        const fragment = ydoc.getXmlFragment(BLOCKNOTE_FRAGMENT_ID);
        const blocks = BLOCKNOTE_EDITOR.yXmlFragmentToBlocks(fragment);
        const stringified = JSON.stringify(blocks);

        // Validate data integrity before saving
        try {
            const parsed = JSON.parse(stringified);
            if (!Array.isArray(parsed)) {
                throw new Error('Serialized blocks is not an array');
            }
        } catch (validationError) {
            throw new Error(`Data validation failed: ${validationError}`);
        }

        await writeTextBlockDb(textBlockId, stringified);
        console.log(`Saved text block ${textBlockId} with ${blocks.length} blocks`);
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
        const textData = textBlock.text;
        let blocks: Block[] = [];
        if (textData && textData.length > 0) {
            try {
                blocks = JSON.parse(textData);
            } catch (e: any) {
                console.warn(`Failed to parse text block data for text block ${textBlockId}`, {
                    error: e,
                    textData,
                });
                const blocksFromMarkdown = await maybeParseMarkdownToBlocks(textData);
                blocks = blocksFromMarkdown;
            }
        }
        if (blocks.length === 0) {
            return new Doc();
        }

        // BlockNote's blocksToYDoc uses 'prosemirror' fragment by default, but we need 'document-store'
        const ydoc = BLOCKNOTE_EDITOR.blocksToYDoc(blocks, BLOCKNOTE_FRAGMENT_ID);

        return ydoc;
    } catch (error: any) {
        console.error(`Unable to load text block ${textBlockId}`, {
            message: error.message,
            trace: error.stack,
        });
        return null;
    }
};

export const createTextBlockWithMarkdown = async (markdownText?: string) => {
    try {
        const blocks = await maybeParseMarkdownToBlocks(markdownText);
        const blocksJsonString = JSON.stringify(blocks);
        const uid = await createTextBlockDb(blocksJsonString);
        return uid;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};

const maybeParseMarkdownToBlocks = async (markdownText?: string): Promise<Block[]> => {
    try {
        let blocks: Block[] = [];
        try {
            if (markdownText) {
                blocks = await BLOCKNOTE_EDITOR.tryParseMarkdownToBlocks(markdownText);
            }
        } catch (e: any) {
            console.error('Failed to parse markdown', {
                error: e,
                markdownText,
            });
            blocks = [];
        }

        //default to blocknote's hardcoded block with the text if for some reason its not valid markdown
        if (!blocks.length && markdownText?.length) {
            blocks = [
                {
                    id: 'initialBlockId',
                    type: 'paragraph',
                    props: {
                        backgroundColor: 'default',
                        textColor: 'default',
                        textAlignment: 'left',
                    },
                    content: [
                        {
                            type: 'text',
                            text: markdownText,
                            styles: {},
                        },
                    ],
                    children: [],
                },
                {
                    id: crypto.randomUUID(),
                    type: 'paragraph',
                    props: {
                        backgroundColor: 'default',
                        textColor: 'default',
                        textAlignment: 'left',
                    },
                    content: [],
                    children: [],
                },
            ];
        }
        return blocks;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return [];
    }
};
