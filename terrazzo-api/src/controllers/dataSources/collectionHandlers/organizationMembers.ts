import { CollectionSource } from '@mosaiq/terrazzo-common';
import { syncCollectionSource } from '@trz-api/broadcasters';
import {
    addMembersToOrgDb,
    getMemberUserIdsByOrgIdDb,
    removeMembersFromOrgDb,
} from '@trz-api/persistence/organizationMembershipPersistence';
import { collectionSourceEditableHandlers } from '../dataSourceWrapper';

export const organizationMembersCollectionHandler = collectionSourceEditableHandlers(
    CollectionSource.OrganizationMembers,
    {
        read: async (parentId) => {
            return await getMemberUserIdsByOrgIdDb(parentId);
        },
        add: async (parentId, itemIds, options) => {
            await addMembersToOrgDb(parentId, itemIds);

            if (!options?.preventSync) {
                for (const userId of itemIds) {
                    try {
                        await syncCollectionSource(userId, CollectionSource.Organizations);
                    } catch (e) {
                        console.error(
                            `Failed to sync organizations for user ${userId} after adding to org ${parentId}:`,
                            e
                        );
                    }
                }
            }
        },
        remove: async (parentId, itemIds) => {
            await removeMembersFromOrgDb(parentId, itemIds);
        },
    }
);
