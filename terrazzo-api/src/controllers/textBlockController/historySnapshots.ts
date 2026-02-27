import { TextBlockId, TextBlockResourceType, TextBlockSnapshot, TextBlockType, UID } from '@mosaiq/terrazzo-common';
import { syncTextHistorySnapshots } from '@trz-api/broadcasters/textBroadcasters';
import {
    deleteTextBlockHistorySnapshotDb,
    getTextBlockHistorySnapshotsForTextBlockDb,
} from '@trz-api/persistence/textBlockHistoryPersistence';
import { SocketManager } from '@trz-api/utils/socket/socketManager';
import { textBlockHandler } from '../dataSources/objectHandlers/textBlock';
import { textBlockSnapshotHandler } from '../dataSources/objectHandlers/textBlockSnapshot';
import { loadTextBlockEncodedData } from './textBlockDocumentCodec';

export const HISTORY_SNAPSHOT_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export const createTextBlockHistorySnapshot = async (
    textBlockId: TextBlockId,
    resourceId: UID,
    resourceType: TextBlockResourceType,
    content: string,
    tags?: string[]
): Promise<void> => {
    await textBlockSnapshotHandler.create({
        textBlockId: textBlockId,
        content,
        tags,
    });
    await reduceSnapshotsForTextBlock(textBlockId);
    await syncTextHistorySnapshots(textBlockId, resourceId, resourceType);
};

/**
 * Fetches all snapshots for a given text block that contain actual content.
 */
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

/**
 * Determines which snapshots to delete based on retention policy.
 * @param snapshots Array of all snapshots for a text block
 * @param currentTime Current timestamp in milliseconds. @defaults to Date.now()
 * @param textBlockType Type of the text block. @defaults to TextBlockType.BlockNote
 * @returns
 */
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

    processSnapshotBucket(lessThan1Hour, HISTORY_SNAPSHOT_INTERVAL_MS, snapshotsToDelete, true);
    processSnapshotBucket(oneHourTo1Day, INTERVAL_30_MIN_MS, snapshotsToDelete, true);
    processSnapshotBucket(moreThan1Day, SESSION_GAP_MS, snapshotsToDelete, false);

    return snapshotsToDelete;
};

/**
 * Reduces the number of snapshots for a given text block according to retention policy.
 * Deletes snapshots that are deemed unnecessary based on age and content.
 */
const reduceSnapshotsForTextBlock = async (textBlockId: TextBlockId) => {
    try {
        const textBlock = await textBlockHandler.read(textBlockId);
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

/**
 * Restores a text block to the content of a specified snapshot.
 */
export const restoreTextBlockSnapshot = async (
    snapshotId: UID,
    resourceId: UID,
    resourceType: TextBlockResourceType
): Promise<void> => {
    try {
        const snapshot = await textBlockSnapshotHandler.read(snapshotId);
        if (!snapshot) {
            throw new Error(`Snapshot ${snapshotId} not found`);
        }
        const textBlock = await textBlockHandler.read(snapshot.textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${snapshot.textBlockId} not found`);
        }
        await createTextBlockHistorySnapshot(textBlock.id, resourceId, resourceType, textBlock.text, ['Pre-Restore']);
        await textBlockHandler.update(textBlock.id, { text: snapshot.content }, { preventSync: true });
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
