import { ObjectSource, ObjectSourceCreateOptions } from '@mosaiq/terrazzo-common';
import {
    createInviteRecordDb,
    getInviteRecordByIdDb,
    updateInviteRecordDb,
} from '@trz-api/persistence/invitePersistence';

export const inviteHandler: ObjectSourceCreateOptions<ObjectSource.Invite> = {
    create: async (data) => {
        await createInviteRecordDb({
            id: crypto.randomUUID(),
            forOrganizationId: data.forOrganizationId,
            maxUses: data.maxUses,
            uses: 0,
            createdById: data.createdById,
            createdAt: Date.now(),
            revokedAt: null,
        });
    },
    update: async (id, data) => {
        await updateInviteRecordDb({ id, ...data });
    },
    read: async (id) => {
        return await getInviteRecordByIdDb(id);
    },
};
