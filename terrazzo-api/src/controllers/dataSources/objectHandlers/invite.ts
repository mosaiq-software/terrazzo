import { CollectionSource, Invite, ObjectSource } from '@mosaiq/terrazzo-common';
import { syncCollectionSource } from '@trz-api/broadcasters';
import {
    createInviteRecordDb,
    getInviteRecordByIdDb,
    updateInviteRecordDb,
} from '@trz-api/persistence/invitePersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const inviteHandler = objectSourceHandlers(ObjectSource.Invite, {
    create: async (data, options) => {
        const invite: Invite = {
            id: crypto.randomUUID(),
            forOrganizationId: data.forOrganizationId,
            maxUses: data.maxUses,
            uses: 0,
            createdById: data.createdById,
            createdAt: Date.now(),
            revokedAt: null,
        };
        await createInviteRecordDb(invite);
        if (!options?.preventSync) {
            try {
                await syncCollectionSource(data.forOrganizationId, CollectionSource.Invites);
            } catch (e) {
                console.error(`Failed to sync new invite collection source`, {
                    organizationId: data.forOrganizationId,
                    error: e,
                });
            }
        }
        return invite.id;
    },
    update: async (id, data) => {
        await updateInviteRecordDb({ id, ...data });
    },
    read: async (id) => {
        return (await getInviteRecordByIdDb(id)) || undefined;
    },
});
