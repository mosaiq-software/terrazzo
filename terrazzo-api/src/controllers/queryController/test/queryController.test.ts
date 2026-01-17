import { QueryItem, UID0 } from '@mosaiq/terrazzo-common';
import { describe, expect, it } from 'vitest';
import { buildSearchIndex } from '../indexers/searchQueryIndexer';
import { executeQuery } from '../queryController';
import {
    buildSearchDataSource,
    makeUid,
    TestBoardConfig,
    TestCardConfig,
    TestDocumentConfig,
} from './queryController.test.helpers';

const orgId = UID0;
const userId = UID0;

const cards1: TestCardConfig[] = [
    { id: makeUid('card-1'), name: 'Card One', number: 1, content: 'This is the first card' },
    { id: makeUid('card-2'), name: 'Card Two', number: 2, content: 'This is the second card' },
    { id: makeUid('card-3'), name: 'Card Three', number: 3, content: 'This is the third card' },
    { id: makeUid('card-4'), name: 'Card Four', number: 4, content: 'This is the fourth card' },
    { id: makeUid('card-5'), name: 'Card Five', number: 5, content: 'This is the fifth card' },
    { id: makeUid('card-6'), name: 'Card Six', number: 6, content: 'This is RM4 Roadmap4 4 1 5 test test 5' },
    {
        id: makeUid('card-7'),
        name: 'Card Seven',
        number: 7,
        content: 'This is the Roadmap RM roadmap roadmap RM RM RM card',
    },
    { id: makeUid('card-8'), name: 'Card Eight', number: 8, content: 'This is the eighth card' },
    { id: makeUid('card-9'), name: 'Card Nine', number: 9, content: 'This is the ninth card' },
    {
        id: makeUid('card-10'),
        name: 'Card Ten',
        number: 10,
        content: 'This is 2 2 2 2 2222222222222222222222222222222 tenth card',
    },
    { id: makeUid('card-11'), name: 'Card Eleven', number: 11, content: 'This is the eleventh card' },
    { id: makeUid('card-12'), name: 'Card Twelve', number: 12, content: 'This is the twelfth card' },
    { id: makeUid('card-13'), name: 'Card Thirteen', number: 13, content: 'This is the thirteenth card' },
    { id: makeUid('card-14'), name: 'Card Fourteen', number: 14, content: 'This is the fourteenth card' },
    { id: makeUid('card-15'), name: 'Card Fifteen', number: 15, content: 'This is the fifteenth card' },
];

const roadmapBoard: TestBoardConfig = {
    id: makeUid('board-roadmap'),
    name: 'Roadmap',
    code: 'RM',
    cards: cards1,
};

const testDocuments: TestDocumentConfig[] = [
    {
        id: makeUid('doc-1'),
        name: 'Document One',
        content: 'This is the content of the first document',
    },
    {
        id: makeUid('doc-2'),
        name: 'Document Two',
        content: 'This is the content of the second document',
    },
    {
        id: makeUid('doc-4'),
        name: 'Document with card id',
        content: 'This document mentions card @[RM-3] Card Three in its content',
    },
];

describe('search query pipeline', () => {
    const buildDataset = async () => {
        const dataSource = buildSearchDataSource({
            orgId,
            boards: [roadmapBoard],
            documents: testDocuments,
        });
        return await buildSearchIndex(dataSource, userId, orgId);
    };

    it('returns the board for board code queries', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM');
        expect(results[0].id).toBe(makeUid('board-roadmap'));

        const resultsLower = await executeQuery(dataset, 'rm');
        checkResults(resultsLower, ['board-roadmap']);

        const resultsWithSpaces = await executeQuery(dataset, ' R  M ');
        checkResults(resultsWithSpaces, ['board-roadmap']);

        const resultsFullName = await executeQuery(dataset, 'Roadmap');
        checkResults(resultsFullName, ['board-roadmap']);
    });

    it('matches card code queries without separators', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM1');
        checkResults(results, ['card-1']);
    });

    it('matches card code queries with dashes', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM-1');
        expect(results[0].id).toBe(makeUid('card-1'));
    });

    it('matches card code queries with spaces', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM 10');
        checkResults(results, ['card-10']);
    });

    it('handles lowercase card code queries', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'rm-1');
        checkResults(results, ['card-1']);
    });

    it('handles extra whitespace in card code queries', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, '  RM    1  ');
        checkResults(results, ['card-1']);
    });

    it('handles leading zeros in card code queries', async () => {
        const dataset = await buildDataset();

        const resultsCard1 = await executeQuery(dataset, 'RM-001');
        checkResults(resultsCard1, ['card-1']);

        const resultsCard10 = await executeQuery(dataset, 'RM-010');
        checkResults(resultsCard10, ['card-10']);
    });

    it('matches digit-only queries against card numbers', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, '2');
        checkResults(results, ['card-2']);
    });

    it('matches long digit sequences to the best card match', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, '2222222222');
        checkResults(results, ['card-10']);
    });

    it('returns board and relevant cards for name matches', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'roadmap');
        checkResults(results, ['board-roadmap', 'card-7']);
    });

    it('ranks exact card code matches higher than name matches', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM4');
        checkResults(results, ['card-4', 'card-6']);
    });

    it('ranks exact card code matches higher than name matches even when name match has a higher fuzzy score', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM5');
        checkResults(results, ['card-5', 'card-15', 'card-6']);
    });

    it('handles mixed alphanumeric queries', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM4 Roadmap4 4 1 5');
        checkResults(results, ['card-4']);
    });

    it('handles queries with special characters', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM-4! Roadmap#4@ 4$ 1% 5^');
        checkResults(results, ['card-4']);
    });

    it('handles empty queries gracefully', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, '');
        expect(results.length).toBe(0);

        const resultsSpaces = await executeQuery(dataset, '     ');
        expect(resultsSpaces.length).toBe(0);
    });

    it('limits the number of results returned', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'card');
        expect(results.length).toBeLessThanOrEqual(10);
    });

    it('is case insensitive', async () => {
        const dataset = await buildDataset();

        const resultsLower = await executeQuery(dataset, 'roadmap');
        checkResults(resultsLower, ['board-roadmap']);

        const resultsUpper = await executeQuery(dataset, 'ROADMAP');
        checkResults(resultsUpper, ['board-roadmap']);
    });

    it('handles body text matches', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'first');
        checkResults(results, [['card-1', 'doc-1']]);
    });

    it('ranks code matches higher than body text matches', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'twelfth RM6 ');
        checkResults(results, ['card-6', 'card-12']);
    });

    it('matches card mentions in documents, but ranks them lower than direct card matches', async () => {
        const dataset = await buildDataset();

        const results = await executeQuery(dataset, 'RM 3');
        expect(results[0].id).toBe(makeUid('card-3'));
        expect(results[1].id).toBe(makeUid('doc-4'));

        const resultsDash = await executeQuery(dataset, '3');
        checkResults(resultsDash, ['card-3', 'card-13', 'doc-4']);
    });
});

/**
 * Helper to check that the results contain the expected IDs in order.
 * @param results The query results
 * @param expectedIds The expected IDs, in order. Can be a string or an array of strings (for multiple acceptable IDs at that position).
 */
const checkResults = (results: QueryItem[], expected: (string | string[])[]) => {
    expect(results.length).toBeGreaterThanOrEqual(expected.length);
    expected.forEach((exp, index) => {
        const resultId = results[index].id;
        if (Array.isArray(exp)) {
            const expIds = exp.map((e) => makeUid(e));
            expect(expIds).toContain(resultId);
        } else {
            expect(resultId).toBe(makeUid(exp));
        }
    });
};
