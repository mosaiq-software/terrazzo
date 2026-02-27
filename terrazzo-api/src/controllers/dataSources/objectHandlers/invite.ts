import { Invite, ObjectSource } from '@mosaiq/terrazzo-common';
import {
    createInviteRecordDb,
    getInviteRecordByIdDb,
    updateInviteRecordDb,
} from '@trz-api/persistence/invitePersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const inviteHandler = objectSourceHandlers(ObjectSource.Invite, {
    create: async (data) => {
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
        return invite.id;
    },
    update: async (id, data) => {
        await updateInviteRecordDb({ id, ...data });
    },
    read: async (id) => {
        return (await getInviteRecordByIdDb(id)) || undefined;
    },
});
