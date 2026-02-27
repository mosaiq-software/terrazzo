import { CollectionSource, parseCompoundKey, RoleId } from '@mosaiq/terrazzo-common';
import { getRoleIdsForUserInOrgDb, setRoleIdsForUserInOrgDb } from '@trz-api/persistence/roleAssignmentPersistence';
import { collectionSourceEditableHandlers } from '../dataSourceWrapper';

export const roleAssignmentsCollectionHandler = collectionSourceEditableHandlers(CollectionSource.RoleAssignments, {
    read: async (parentId) => {
        const { a: userId, b: orgId } = parseCompoundKey(parentId);
        return await getRoleIdsForUserInOrgDb(userId, orgId);
    },
    add: async (parentId, itemIds) => {
        const { a: userId, b: orgId } = parseCompoundKey(parentId);
        const current = await getRoleIdsForUserInOrgDb(userId, orgId);
        const next = new Set<RoleId>(current);
        for (const id of itemIds) next.add(id);
        await setRoleIdsForUserInOrgDb(userId, orgId, Array.from(next));
    },
    remove: async (parentId, itemIds) => {
        const { a: userId, b: orgId } = parseCompoundKey(parentId);
        const current = await getRoleIdsForUserInOrgDb(userId, orgId);
        const remove = new Set<RoleId>(itemIds);
        const next = current.filter((id) => !remove.has(id));
        await setRoleIdsForUserInOrgDb(userId, orgId, next);
    },
});
