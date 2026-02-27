import { ObjectSource, UserHeader } from '@mosaiq/terrazzo-common';
import { createUserHeaderDb, getUserHeaderByIdDb, updateUserHeaderDb } from '@trz-api/persistence/userPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const userHandler = objectSourceHandlers(ObjectSource.User, {
    create: async (data) => {
        const newUser: UserHeader = {
            id: crypto.randomUUID(),
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            profilePicture: data.profilePicture || '',
        };
        await createUserHeaderDb(newUser);
        return newUser.id;
    },
    update: async (id, data) => {
        await updateUserHeaderDb(id, data);
    },
    read: async (id) => {
        return (await getUserHeaderByIdDb(id)) || undefined;
    },
});
