import { Block } from '@blocknote/core';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { BLOCKNOTE_FRAGMENT_ID, exhaustiveCheck, TextBlockHistorySnapshot, TextBlockId, TextBlockResourceType, TextBlockType, UID, UserId } from '@mosaiq/terrazzo-common';
import { syncTextHistorySnapshots } from '@trz-api/broadcasters/textBroadcasters';
import { getCardByIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentByIdDb } from '@trz-api/persistence/documentPersistence';
import { createTextBlockHistorySnapshotDb } from '@trz-api/persistence/textBlockHistoryPersistence';
import { createTextBlockDb, getTextBlockByIdDb, updateTextBlockDb } from '@trz-api/persistence/textBlockPersistence';
import { userCanEditCard, userCanEditDocument } from '@trz-api/utils/permissions';
import { Document } from '@trz-api/utils/y-socket-io';
import console from 'console';
import { applyPatch, createPatch } from 'diff';
import { Doc, XmlText } from 'yjs';
import { getBoardIDFromCardID } from './cardController';

export const checkCanUserEditTextBlock = async (userId: UserId | undefined, resourceId: UID, resourceType: TextBlockResourceType): Promise<TextBlockId | undefined> => {
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

const BLOCKNOTE_EDITOR = ServerBlockNoteEditor.create();

const SNAPSHOT_INTERVAL_MS = 1; //5 * 60 * 1000; // 5 minutes

export const storeTextBlockEncodedData = async (doc: Document): Promise<void> => {
    try {
        const { textBlockId, resourceId, resourceType } = doc;
        const textBlock = await getTextBlockByIdDb(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }

        let content: string = '';
        let prettyContent: string = '';
        switch (textBlock.type) {
            case TextBlockType.PlainText: {
                const fragment = doc.getXmlFragment(BLOCKNOTE_FRAGMENT_ID);
                const textElements = fragment.toArray().filter((item) => item instanceof XmlText) as XmlText[];
                content = textElements.map((te) => te.toString()).join('\n');
                prettyContent = content; // Plain text doesn't need separate pretty version
                break;
            }
            case TextBlockType.BlockNote: {
                const fragment = doc.getXmlFragment(BLOCKNOTE_FRAGMENT_ID);
                const blocks = BLOCKNOTE_EDITOR.yXmlFragmentToBlocks(fragment);
                content = JSON.stringify(blocks); // Compact for storage
                prettyContent = JSON.stringify(blocks, null, 2); // Pretty for diffing
                break;
            }
        }

        const now = Date.now();
        if (textBlock.trackHistory && textBlock.lastSnapshotAt !== undefined && now - textBlock.lastSnapshotAt >= SNAPSHOT_INTERVAL_MS) {
            // Get the previous snapshot's text and pretty-print it for diffing
            const previousText = textBlock.text || '';
            let previousPrettyText = previousText;
            if (textBlock.type === TextBlockType.BlockNote && previousText) {
                try {
                    const previousBlocks = JSON.parse(previousText);
                    previousPrettyText = JSON.stringify(previousBlocks, null, 2);
                } catch (e) {
                    // If parsing fails, use as-is
                    previousPrettyText = previousText;
                }
            }

            // Compute diff on pretty-printed versions for efficient line-based diffs
            const patch = getSnapshotDifference(previousPrettyText, prettyContent);

            // Store compact version in database
            await updateTextBlockDb(textBlockId, { text: content, lastSnapshotAt: now });
            const snapshot: TextBlockHistorySnapshot = {
                snapshotId: crypto.randomUUID(),
                textBlockId: textBlockId,
                timestamp: now,
                diff: patch,
            };
            await createTextBlockHistorySnapshotDb(snapshot);
            await syncTextHistorySnapshots(textBlockId, resourceId, resourceType);
        } else {
            await updateTextBlockDb(textBlockId, { text: content });
        }
    } catch (error: any) {
        console.error('Unable to save text block ' + doc.textBlockId + ' : ' + error.message);
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

/**
 * Given two strings, compute a Git-style patch that represents the changes from oldText to newText.
 * Only stores the actual changes (additions/deletions) with minimal context, not all unchanged content.
 * This is space-efficient like Git patches.
 * @param oldText The original text
 * @param newText The new text with changes applied
 * @return A patch string that can be applied to oldText to get newText
 */
const getSnapshotDifference = (oldText: string, newText: string): string => {
    // createPatch generates a unified diff format (like Git)
    // We use empty filename since we're just diffing content
    const patch = createPatch('', oldText, newText, '', '');
    return patch;
};

/**
 * Apply a Git-style patch to base text to get the next version.
 * This is like applying a Git commit - the patch only contains the delta.
 * @param baseText The text to apply the patch to
 * @param patch The patch string from getSnapshotDifference
 * @return The reconstructed text after applying the patch
 */
const applySnapshotDifference = (baseText: string, patch: string): string => {
    const result = applyPatch(baseText, patch);
    if (result === false) {
        throw new Error('Failed to apply snapshot patch - patch may be corrupted or incompatible');
    }
    return result;
};

/**
 * Given a series of snapshot patches, reconstruct the full text by applying them in order.
 * Starts from an empty string and applies each patch sequentially, like Git commits.
 * This is how we rebuild any version in the history: apply patches 1 through N.
 * @param snapshotPatches Array of patch strings in chronological order
 * @return The final reconstructed text
 */
const reconstructTextFromSnapshots = (snapshotPatches: string[]): string => {
    let text = '';

    for (const patch of snapshotPatches) {
        text = applySnapshotDifference(text, patch);
    }

    return text;
};
