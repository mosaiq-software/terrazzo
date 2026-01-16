import { describe, expect, it } from 'vitest';
import { buildSearchIndex } from '../indexers/searchQueryIndexer';
import { executeQuery } from '../queryController';
import { buildSearchDataSource, makeUid, TestDocumentConfig } from './queryController.test.helpers';

describe('search query pipeline', () => {
    it('returns the best matching card for card code searches', async () => {
        const userId = makeUid('user-1');
        const orgId = makeUid('org-1');

        const dataSource = buildSearchDataSource({
            orgId,
            boards: [
                {
                    id: makeUid('board-1'),
                    name: 'Roadmap',
                    code: 'RM',
                    cards: [
                        { id: makeUid('card-1'), name: 'Release Plan', number: 12, content: 'launch alpha' },
                        { id: makeUid('card-2'), name: 'Beta Tasks', number: 7, content: 'prepare beta release' },
                    ],
                },
            ],
        });

        const dataset = await buildSearchIndex(dataSource, userId, orgId);
        const results = await executeQuery(dataset, 'RM-12');

        expect(results[0]).toEqual({
            id: makeUid('card-1'),
            type: 'card',
            display: '[RM-12] Release Plan',
        });
    });

    it('prioritizes document title matches for phrase searches', async () => {
        const userId = makeUid('user-2');
        const orgId = makeUid('org-1');

        const dataSource = buildSearchDataSource({
            orgId,
            boards: [
                {
                    id: makeUid('board-1'),
                    name: 'Projects',
                    code: 'PRJ',
                    cards: [{ id: makeUid('card-1'), name: 'Alpha Task', number: 3, content: 'alpha' }],
                },
            ],
            documents: [{ id: makeUid('doc-1'), name: 'Alpha Spec', content: 'alpha spec details' }],
        });

        const dataset = await buildSearchIndex(dataSource, userId, orgId);
        const results = await executeQuery(dataset, 'alpha spec');

        expect(results[0]?.id).toBe(makeUid('doc-1'));
        expect(results[0]?.display).toBe('Alpha Spec');
    });

    it('handles diacritics-insensitive searches', async () => {
        const userId = makeUid('user-3');
        const orgId = makeUid('org-1');

        const dataSource = buildSearchDataSource({
            orgId,
            documents: [{ id: makeUid('doc-1'), name: 'Café Plan', content: 'café roadmap' }],
        });

        const dataset = await buildSearchIndex(dataSource, userId, orgId);
        const results = await executeQuery(dataset, 'cafe plan');

        expect(results[0]?.id).toBe(makeUid('doc-1'));
    });

    it('limits results to the top 10', async () => {
        const userId = makeUid('user-4');
        const orgId = makeUid('org-1');

        const documents: TestDocumentConfig[] = Array.from({ length: 11 }).map((_, index) => ({
            id: makeUid(`doc-${index}`),
            name: `Doc ${index}`,
            content: `Doc ${index} foo bar baz`,
        }));

        const dataSource = buildSearchDataSource({
            orgId,
            documents,
        });

        const dataset = await buildSearchIndex(dataSource, userId, orgId);
        const results = await executeQuery(dataset, 'foo');

        expect(results).toHaveLength(10);
    });

    it('does not return content to the client', async () => {
        const userId = makeUid('user-5');
        const orgId = makeUid('org-1');

        const dataSource = buildSearchDataSource({
            orgId,
            documents: [{ id: makeUid('doc-1'), name: 'Release Notes', content: 'notes' }],
        });

        const dataset = await buildSearchIndex(dataSource, userId, orgId);
        const results = await executeQuery(dataset, 'release');

        expect(results[0]).toBeDefined();
        expect('content' in results[0]).toBe(false);
    });
});
