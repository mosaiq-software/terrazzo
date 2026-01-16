// import { OrganizationId, UserId } from '@mosaiq/terrazzo-common';
// import { beforeEach, describe, expect, it, vi } from 'vitest';
// import * as searchIndexer from '../indexers/searchQueryIndexer';
// import { executeSearchQueryForUser } from '../queryController';
// import { assertScoresAscending, buildSearchDatapoints, DocumentConfig, makeUid } from './queryController.test.helpers';
// import './queryController.test.mocks';

// beforeEach(() => {
//     vi.clearAllMocks();
// });

// describe('executeSearchQueryForUser', () => {
//     it('returns the best matching card for card code searches and orders by score', async () => {
//         const userId = makeUid('user-1') as UserId;
//         const orgId = makeUid('org-1') as OrganizationId;
//         const sessionId = 'session-1';

//         await buildSearchDatapoints({
//             userId,
//             orgId,
//             boards: [
//                 {
//                     id: makeUid('board-1'),
//                     name: 'Roadmap',
//                     code: 'RM',
//                     cards: [
//                         {
//                             id: makeUid('card-1'),
//                             name: 'Release Plan',
//                             number: 12,
//                             content: 'launch alpha',
//                         },
//                         {
//                             id: makeUid('card-2'),
//                             name: 'Beta Tasks',
//                             number: 7,
//                             content: 'prepare beta release',
//                         },
//                         {
//                             id: makeUid('card-3'),
//                             name: 'Final Review',
//                             number: 20,
//                             content: 'finalize for launch',
//                         },
//                     ],
//                 },
//             ],
//         });

//         const results = await executeSearchQueryForUser(userId, orgId, 'RM-12', sessionId);

//         expect(results[0]?.id).toBe(makeUid('card-1'));
//         assertScoresAscending(results.map((result) => result.score));
//     });

//     it('prioritizes document title matches for phrase searches', async () => {
//         const userId = makeUid('user-2') as UserId;
//         const orgId = makeUid('org-1') as OrganizationId;
//         const sessionId = 'session-2';

//         await buildSearchDatapoints({
//             userId,
//             orgId,
//             boards: [
//                 {
//                     id: makeUid('board-1'),
//                     name: 'Projects',
//                     code: 'PRJ',
//                     cards: [{ id: makeUid('card-1'), name: 'Alpha Task', number: 3, content: 'alpha' }],
//                 },
//             ],
//             documents: [{ id: makeUid('doc-1'), name: 'Alpha Spec', content: 'alpha spec details' }],
//         });

//         const results = await executeSearchQueryForUser(userId, orgId, 'alpha spec', sessionId);

//         expect(results[0]?.id).toBe(makeUid('doc-1'));
//         assertScoresAscending(results.map((result) => result.score));
//     });

//     it('handles diacritics-insensitive searches', async () => {
//         const userId = makeUid('user-3') as UserId;
//         const orgId = makeUid('org-1') as OrganizationId;
//         const sessionId = 'session-3';

//         await buildSearchDatapoints({
//             userId,
//             orgId,
//             documents: [{ id: makeUid('doc-1'), name: 'Café Plan', content: 'café roadmap' }],
//         });

//         const results = await executeSearchQueryForUser(userId, orgId, 'cafe plan', sessionId);

//         expect(results[0]?.id).toBe(makeUid('doc-1'));
//     });

//     it('limits results to the top 10 by score', async () => {
//         const userId = makeUid('user-4') as UserId;
//         const orgId = makeUid('org-1') as OrganizationId;
//         const sessionId = 'session-4';

//         const documents: DocumentConfig[] = Array.from({ length: 11 }).map((_, index) => ({
//             id: makeUid(`doc-${index}`),
//             name: `Doc ${index}`,
//             content: `Doc ${index} foo bar baz`,
//         }));

//         await buildSearchDatapoints({
//             userId,
//             orgId,
//             documents,
//         });

//         const results = await executeSearchQueryForUser(userId, orgId, 'foo', sessionId);

//         expect(results).toHaveLength(10);
//         assertScoresAscending(results.map((result) => result));
//     });

//     it('caches queryable data by search session id', async () => {
//         const userId = makeUid('user-5') as UserId;
//         const orgId = makeUid('org-1') as OrganizationId;

//         const searchIndexerSpy = vi.spyOn(searchIndexer, 'getAllQueryableDataForUserInOrg');

//         await buildSearchDatapoints({
//             userId,
//             orgId,
//             documents: [{ id: makeUid('doc-1'), name: 'Release Notes', content: 'notes' }],
//         });
//         searchIndexerSpy.mockClear();

//         await executeSearchQueryForUser(userId, orgId, 'release', 'session-a');
//         await executeSearchQueryForUser(userId, orgId, 'notes', 'session-a');
//         await executeSearchQueryForUser(userId, orgId, 'notes', 'session-b');

//         expect(searchIndexerSpy).toHaveBeenCalledTimes(2);
//     });
// });
