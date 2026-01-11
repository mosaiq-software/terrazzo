import {
    daysMs,
    fixedTimestamp,
    hoursMs,
    minutesMs,
    TextBlockSnapshot,
    UID,
    UID0,
    UID1,
    UID2,
    UID3,
    UID4,
    UID5,
    UID6,
} from '@mosaiq/terrazzo-common';
import { describe, expect, it } from 'vitest';
import { determineSnapshotsToDelete } from './textBlockController';

describe('determineSnapshotsToDelete', () => {
    const createSnapshot = (id: UID, msAgo: number, now: number, content?: string): TextBlockSnapshot => ({
        snapshotId: id,
        textBlockId: UID0,
        timestamp: now - msAgo,
        content: content ?? `content-${id}`,
    });

    it('should return empty set for empty snapshot list', () => {
        const result = determineSnapshotsToDelete([], fixedTimestamp());
        expect(result.size).toBe(0);
    });

    it('should return empty set for single snapshot', () => {
        const snapshots = [createSnapshot(UID1, minutesMs(10), fixedTimestamp())];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        expect(result.size).toBe(0);
    });

    it('should handle snapshots with identical timestamps', () => {
        const snapshots = [
            createSnapshot(UID1, minutesMs(10), fixedTimestamp()),
            createSnapshot(UID2, minutesMs(10), fixedTimestamp()),
            createSnapshot(UID3, minutesMs(10), fixedTimestamp()),
        ];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        // Should delete 2 of the 3
        expect(result.size).toBe(2);
    });

    it('should handle snapshots with identical content', () => {
        const snapshots = [
            createSnapshot(UID1, minutesMs(10), fixedTimestamp(), 'same content'),
            createSnapshot(UID2, minutesMs(9), fixedTimestamp(), 'same content'),
            createSnapshot(UID3, minutesMs(8), fixedTimestamp(), 'same content'),
        ];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        // Should delete 2 of the 3
        expect(result.size).toBe(2);
    });

    it('should delete any snapshots with no content', () => {
        const snapshots = [createSnapshot(UID1, minutesMs(10), fixedTimestamp(), '')];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        expect(result.size).toBe(1);
        expect(result.has(UID1)).toBe(true);
    });

    it('should keep all snapshots less than 1 hour old', () => {
        const snapshots = [
            createSnapshot(UID1, minutesMs(5), fixedTimestamp()),
            createSnapshot(UID2, minutesMs(10), fixedTimestamp()),
            createSnapshot(UID3, minutesMs(20), fixedTimestamp()),
            createSnapshot(UID4, minutesMs(30), fixedTimestamp()),
            createSnapshot(UID5, minutesMs(45), fixedTimestamp()),
            createSnapshot(UID6, minutesMs(59), fixedTimestamp()),
        ];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        expect(result.size).toBe(0);
    });

    it('should keep one snapshot per 30-minute window', () => {
        const snapshots = [
            // Bucket 1
            createSnapshot(UID1, minutesMs(70), fixedTimestamp()),
            createSnapshot(UID2, minutesMs(75), fixedTimestamp()), // should delete
            // Bucket 2
            createSnapshot(UID3, minutesMs(108), fixedTimestamp()),
            createSnapshot(UID4, minutesMs(110), fixedTimestamp()), // should delete
            // Bucket 3
            createSnapshot(UID5, minutesMs(140), fixedTimestamp()),
        ];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        expect(result.size).toBe(2);
        expect(result.has(UID2)).toBe(true);
        expect(result.has(UID4)).toBe(true);
    });

    it('should handle exactly 30-minute intervals', () => {
        const snapshots = [
            createSnapshot(UID1, minutesMs(90), fixedTimestamp()),
            createSnapshot(UID2, minutesMs(120), fixedTimestamp()),
            createSnapshot(UID3, minutesMs(150), fixedTimestamp()),
        ];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        expect(result.size).toBe(0);
    });

    it('should handle burst of edits followed by gap', () => {
        const snapshots = [
            // Bucket 1 - burst
            createSnapshot(UID1, minutesMs(70), fixedTimestamp()), // keep
            createSnapshot(UID2, minutesMs(72), fixedTimestamp()), // delete
            createSnapshot(UID3, minutesMs(74), fixedTimestamp()), // delete
            createSnapshot(UID4, minutesMs(76), fixedTimestamp()), // delete
            createSnapshot(UID5, minutesMs(78), fixedTimestamp()), // delete
            // Bucket 2 - gap
            createSnapshot(UID6, minutesMs(200), fixedTimestamp()), // keep
        ];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        expect(result.size).toBe(4);
        expect(result.has(UID1)).toBe(false);
        expect(result.has(UID2)).toBe(true);
        expect(result.has(UID3)).toBe(true);
        expect(result.has(UID4)).toBe(true);
        expect(result.has(UID5)).toBe(true);
        expect(result.has(UID6)).toBe(false);
    });

    it('should handle boundary at exactly 1 hour', () => {
        const snapshots = [
            createSnapshot(UID1, minutesMs(59), fixedTimestamp()), // keep (<1hr)
            createSnapshot(UID2, minutesMs(60), fixedTimestamp()), // keep (first in 1hr-1day bucket)
            createSnapshot(UID3, minutesMs(61), fixedTimestamp()), // delete (within 30min of UID2)
        ];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        expect(result.size).toBe(1);
        expect(result.has(UID3)).toBe(true);
    });

    it('should keep one snapshot per editing session', () => {
        const snapshots = [
            // Session 1
            createSnapshot(UID1, daysMs(2) + minutesMs(10), fixedTimestamp()), // keep
            createSnapshot(UID2, daysMs(2) + minutesMs(20), fixedTimestamp()), // delete
            createSnapshot(UID3, daysMs(2) + hoursMs(2) + minutesMs(5), fixedTimestamp()), // delete
            // Session 2
            createSnapshot(UID4, daysMs(2) + hoursMs(7) + minutesMs(15), fixedTimestamp()), // keep
            createSnapshot(UID5, daysMs(2) + hoursMs(7) + minutesMs(25), fixedTimestamp()), // delete
            // Session 3
            createSnapshot(UID6, daysMs(3) + hoursMs(1), fixedTimestamp()), // keep
        ];
        const result = determineSnapshotsToDelete(snapshots, fixedTimestamp());
        expect(result.size).toBe(3);
        expect(result.has(UID2)).toBe(true);
        expect(result.has(UID3)).toBe(true);
        expect(result.has(UID5)).toBe(true);
    });
});
