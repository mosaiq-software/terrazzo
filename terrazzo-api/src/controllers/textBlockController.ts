import { Block, BlockNoteSchema, createInlineContentSpec, defaultInlineContentSpecs } from '@blocknote/core';
import { ServerBlockNoteEditor } from '@blocknote/server-util';
import {
    BLOCKNOTE_FRAGMENT_ID,
    exhaustiveCheck,
    TextBlockId,
    TextBlockResourceType,
    TextBlockSnapshot,
    TextBlockType,
    UID,
    UserId,
} from '@mosaiq/terrazzo-common';
import { syncTextHistorySnapshots } from '@trz-api/broadcasters/textBroadcasters';
import { getCardByIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentByIdDb } from '@trz-api/persistence/documentPersistence';
import {
    createTextBlockHistorySnapshotDb,
    deleteTextBlockHistorySnapshotDb,
    getTextBlockHistorySnapshotDb,
    getTextBlockHistorySnapshotsForTextBlockDb,
} from '@trz-api/persistence/textBlockHistoryPersistence';
import { createTextBlockDb, getTextBlockByIdDb, updateTextBlockDb } from '@trz-api/persistence/textBlockPersistence';
import { userCanEditCard, userCanEditDocument } from '@trz-api/utils/permissions';
import { SocketManager } from '@trz-api/utils/socket/socketManager';
import { Document } from '@trz-api/utils/y-socket-io';
import console from 'console';
import { JSDOM } from 'jsdom';
import { Doc, XmlText } from 'yjs';
import { getBoardIDFromCardID } from './cardController';

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

const BlockNoteMention = createInlineContentSpec(
    {
        type: 'mention',
        content: 'none',
        propSchema: {
            tag: {
                default: '',
            },
            id: {
                default: '',
            },
            type: {
                default: '',
            },
        },
    },
    {
        render: (inlineContent) => {
            const dom = new JSDOM('<!doctype html><html><body></body></html>');
            const document = dom.window.document;

            const serverSideHtml = document.createElement('span');
            serverSideHtml.className = 'bn-mention';
            const tag = inlineContent?.props?.tag || '';
            const id = inlineContent?.props?.id || '';
            serverSideHtml.textContent = `@${tag}`;
            serverSideHtml.setAttribute('data-mention-id', id);

            return { dom: serverSideHtml };
        },
    }
);

const BNSchema = BlockNoteSchema.create().extend({
    blockSpecs: {},
    inlineContentSpecs: {
        ...defaultInlineContentSpecs,
        mention: BlockNoteMention,
    },
});

const BLOCKNOTE_EDITOR = ServerBlockNoteEditor.create({
    schema: BNSchema,
});

const SNAPSHOT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

const getContentFromDoc = (doc: Document, type: TextBlockType): string => {
    const fragment = doc.getXmlFragment(BLOCKNOTE_FRAGMENT_ID);
    switch (type) {
        case TextBlockType.PlainText: {
            const textElements = fragment.toArray().filter((item) => item instanceof XmlText) as XmlText[];
            return textElements.map((te) => te.toString()).join('\n');
        }
        case TextBlockType.BlockNote: {
            const blocks = BLOCKNOTE_EDITOR.yXmlFragmentToBlocks(fragment);
            return JSON.stringify(blocks); // Compact for storage
        }
        default:
            return exhaustiveCheck(type, `Unsupported text block type for content extraction`);
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
            ((textBlock.lastSnapshotAt !== undefined && now - textBlock.lastSnapshotAt >= SNAPSHOT_INTERVAL_MS) ||
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

export const createTextBlockHistorySnapshot = async (
    textBlockId: TextBlockId,
    resourceId: UID,
    resourceType: TextBlockResourceType,
    content: string,
    tags?: string[]
): Promise<void> => {
    const snapshot: TextBlockSnapshot = {
        snapshotId: crypto.randomUUID(),
        textBlockId: textBlockId,
        timestamp: Date.now(),
        content,
        tags,
    };
    await createTextBlockHistorySnapshotDb(snapshot);
    await reduceSnapshotsForTextBlock(textBlockId);
    await syncTextHistorySnapshots(textBlockId, resourceId, resourceType);
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

export const getTextBlockSnapshotsWithContent = async (textBlockId: TextBlockId): Promise<TextBlockSnapshot[]> => {
    try {
        // Snapshots already contain full content - just return them
        const snapshots = await getTextBlockHistorySnapshotsForTextBlockDb(textBlockId);
        return snapshots;
    } catch (error: any) {
        console.error(`Unable to get text block snapshots with content for text block ${textBlockId}`, {
            message: error.message,
            trace: error.stack,
        });
        return [];
    }
};

/**
 * Process a bucket of snapshots and determine which ones to delete based on time intervals.
 * @param snapshots - Array of snapshots to process (assumes first snapshot is always kept)
 * @param intervalMs - Minimum time interval between kept snapshots
 * @param snapshotsToDelete - Set to add snapshot IDs that should be deleted
 * @param fixedTimeBlocks - If true, only consider fixed time intervals; if false, allow variable intervals
 */
const processSnapshotBucket = (
    snapshots: TextBlockSnapshot[],
    intervalMs: number,
    snapshotsToDelete: Set<UID>,
    fixedTimeBlocks: boolean = false
): void => {
    if (snapshots.length === 0) {
        return;
    }

    let lastTimestamp = snapshots[0].timestamp; // Keep first snapshot in bucket

    for (let i = 1; i < snapshots.length; i++) {
        const snapshot = snapshots[i];
        const timeSinceLast = lastTimestamp - snapshot.timestamp;

        if (timeSinceLast >= intervalMs || snapshot.tags?.length) {
            // Keep this snapshot - sufficient time has passed
            lastTimestamp = snapshot.timestamp;
        } else {
            // Delete this snapshot - too soon after last kept
            snapshotsToDelete.add(snapshot.snapshotId);
            if (!fixedTimeBlocks) {
                lastTimestamp = snapshot.timestamp;
            }
        }
    }
};

export const determineSnapshotsToDelete = (
    snapshots: TextBlockSnapshot[],
    currentTime: number = Date.now(),
    textBlockType: TextBlockType = TextBlockType.BlockNote
): Set<UID> => {
    const snapshotsToDelete = new Set<UID>();

    // Remove duplicates or empty content
    const filteredSnapshots: TextBlockSnapshot[] = [];
    const seenTimestamps = new Set<number>();
    let lastSeenSnapshot: TextBlockSnapshot | null = null;
    for (const snapshot of snapshots) {
        // Delete empty content snapshots
        if (
            !snapshot.content ||
            snapshot.content.length === 0 ||
            (textBlockType === TextBlockType.BlockNote && snapshot.content === '[]')
        ) {
            snapshotsToDelete.add(snapshot.snapshotId);
            continue;
        }

        // Delete duplicate timestamp snapshots
        if (seenTimestamps.has(snapshot.timestamp)) {
            snapshotsToDelete.add(snapshot.snapshotId);
            continue;
        }
        seenTimestamps.add(snapshot.timestamp);

        // Delete consecutive duplicate content snapshots
        // Prioritize deleting snapshots without tags if content is the same
        if (lastSeenSnapshot !== null && snapshot.content === lastSeenSnapshot.content) {
            const thisSnapHasTags = snapshot.tags && snapshot.tags.length > 0;
            const lastSnapHasTags = lastSeenSnapshot.tags && lastSeenSnapshot.tags.length > 0;
            if (!lastSnapHasTags && thisSnapHasTags) {
                snapshotsToDelete.add(lastSeenSnapshot.snapshotId);
                filteredSnapshots.pop();
            } else if (!thisSnapHasTags && lastSnapHasTags) {
                snapshotsToDelete.add(snapshot.snapshotId);
            } else if (!thisSnapHasTags && !lastSnapHasTags) {
                snapshotsToDelete.add(snapshot.snapshotId);
            }
            lastSeenSnapshot = snapshot;
            continue;
        }
        lastSeenSnapshot = snapshot;

        filteredSnapshots.push(snapshot);
    }

    if (filteredSnapshots.length <= 1) {
        // Nothing to delete
        return snapshotsToDelete;
    }

    // Time constants
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const INTERVAL_30_MIN_MS = 30 * 60 * 1000;
    const SESSION_GAP_MS = 3 * 60 * 60 * 1000; // 3 hours

    // Split snapshots into time buckets based on age
    const lessThan1Hour: TextBlockSnapshot[] = [];
    const oneHourTo1Day: TextBlockSnapshot[] = [];
    const moreThan1Day: TextBlockSnapshot[] = [];

    for (const snapshot of filteredSnapshots) {
        const age = currentTime - snapshot.timestamp;
        if (age < ONE_HOUR_MS) {
            lessThan1Hour.push(snapshot);
        } else if (age < ONE_DAY_MS) {
            oneHourTo1Day.push(snapshot);
        } else {
            moreThan1Day.push(snapshot);
        }
    }

    processSnapshotBucket(lessThan1Hour, SNAPSHOT_INTERVAL_MS, snapshotsToDelete, true);
    processSnapshotBucket(oneHourTo1Day, INTERVAL_30_MIN_MS, snapshotsToDelete, true);
    processSnapshotBucket(moreThan1Day, SESSION_GAP_MS, snapshotsToDelete, false);

    return snapshotsToDelete;
};

const reduceSnapshotsForTextBlock = async (textBlockId: TextBlockId) => {
    try {
        const textBlock = await getTextBlockByIdDb(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }
        const snapshots = await getTextBlockHistorySnapshotsForTextBlockDb(textBlockId);
        const snapshotsToDelete = determineSnapshotsToDelete(snapshots, Date.now(), textBlock.type);

        // Execute deletions
        if (snapshotsToDelete.size > 0) {
            for (const snapshotId of snapshotsToDelete) {
                await deleteTextBlockHistorySnapshotDb(snapshotId);
            }
        }
    } catch (error: any) {
        console.error(`Unable to reduce text block snapshots for text block ${textBlockId}`, {
            message: error.message,
            trace: error.stack,
        });
    }
};

export const restoreTextBlockSnapshot = async (
    snapshotId: UID,
    resourceId: UID,
    resourceType: TextBlockResourceType
): Promise<void> => {
    try {
        const snapshot = await getTextBlockHistorySnapshotDb(snapshotId);
        if (!snapshot) {
            throw new Error(`Snapshot ${snapshotId} not found`);
        }
        const textBlock = await getTextBlockByIdDb(snapshot.textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${snapshot.textBlockId} not found`);
        }
        await createTextBlockHistorySnapshot(textBlock.id, resourceId, resourceType, textBlock.text, ['Pre-Restore']);
        await updateTextBlockDb(textBlock.id, { text: snapshot.content });
        await createTextBlockHistorySnapshot(textBlock.id, resourceId, resourceType, snapshot.content, ['Restored']);
        const ydoc = await loadTextBlockEncodedData(textBlock.id);
        if (!ydoc) {
            throw new Error(`Failed to load YDoc for text block ${textBlock.id} during snapshot restore`);
        }
        await SocketManager.getInstance().yio.broadcastDocumentUpdate(snapshot.textBlockId, ydoc);
    } catch (error: any) {
        console.error(`Unable to restore text block snapshot ${snapshotId}`, {
            message: error.message,
            trace: error.stack,
        });
        throw error;
    }
};

/**
 * Gets the text content of a text block suitable for querying/indexing.
 * If the block is plain text, returns the text directly.
 * If the block is BlockNote, extracts the content from the stored blocks.
 */
export const getQueryableTextBlockContent = async (textBlockId: TextBlockId): Promise<string> => {
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

const convertBlocknoteBlocksToPlaintext = async (blocks: Block[]): Promise<string> => {
    const html = await BLOCKNOTE_EDITOR.blocksToHTMLLossy(blocks);
    return getInnerTextFromHtml(html);
};

const getInnerTextFromHtml = (html: string): string => {
    const blockLevelTags = ['div', 'p', 'br', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];
    let text = html;
    for (const tag of blockLevelTags) {
        const regexOpen = new RegExp(`<${tag}[^>]*>`, 'gi');
        const regexClose = new RegExp(`</${tag}>`, 'gi');
        text = text.replace(regexOpen, '\n').replace(regexClose, '\n');
    }
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/\n+/g, '\n').trim();
    return text;
};
