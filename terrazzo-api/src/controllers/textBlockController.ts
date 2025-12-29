import { Block } from '@blocknote/core';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { BLOCKNOTE_FRAGMENT_ID, TextBlockId, UserId } from '@mosaiq/terrazzo-common';
import { getCardsByDescriptionTextBlockIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentsByTextBlockIdDb } from '@trz-api/persistence/documentPersistence';
import { createTextBlockDb, getTextBlockByIdDb, writeTextBlockDb } from '@trz-api/persistence/textBlockPersistence';
import { userCanEditCard, userCanEditDocument } from '@trz-api/utils/permissions';
import { Doc } from 'yjs';

export const checkCanUserEditTextBlock = async (userId: UserId | undefined, textBlockId: TextBlockId, resourceType: 'card' | 'document'): Promise<boolean> => {
    switch (resourceType) {
        case 'card': {
            const cards = await getCardsByDescriptionTextBlockIdDb(textBlockId);
            if (cards.length !== 1) {
                return false;
            }
            const card = cards[0];
            if (!(await userCanEditCard(userId, card.id))) {
                return false;
            }
            return true;
        }
        case 'document': {
            const documents = await getDocumentsByTextBlockIdDb(textBlockId);
            if (documents.length !== 1) {
                return false;
            }
            const document = documents[0];
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
        await writeTextBlockDb(textBlockId, stringified);
    } catch (error: any) {
        console.error('Unable to save text block ' + textBlockId + ' : ' + error.message);
        throw new Error('Unable to save text block ' + textBlockId + ' : ' + error.message);
    }
};

export const loadTextBlockEncodedData = async (textBlockId: TextBlockId): Promise<Doc | null> => {
    try {
        const textBlock = await getTextBlockByIdDb(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }
        const textData = textBlock.text;
        const blocks = JSON.parse(textData) as Block[];
        console.log('blocks', blocks);
        if (blocks.length === 0) {
            return new Doc();
        }
        const ydoc = BLOCKNOTE_EDITOR.blocksToYDoc(blocks);
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
        let blocksJsonString = '';
        try {
            if (markdownText) {
                const blocks = BLOCKNOTE_EDITOR.tryParseMarkdownToBlocks(markdownText);
                blocksJsonString = JSON.stringify(blocks);
            }
        } catch (e: any) {
            console.error('Failed to parse markdown', {
                error: e,
                markdownText,
            });
            blocksJsonString = '';
        }

        //default to blocknote's hardcoded block with the text if for some reason its not valid markdown
        if (!blocksJsonString?.length && markdownText?.length) {
            blocksJsonString = JSON.stringify([
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
            ]);
        }
        const uid = await createTextBlockDb(blocksJsonString);
        return uid;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};
