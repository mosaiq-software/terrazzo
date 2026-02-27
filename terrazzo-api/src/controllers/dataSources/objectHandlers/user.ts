import { ObjectSource, SYSTEM_USER_ID, UserHeader } from '@mosaiq/terrazzo-common';
import { getUniqueUsername, seedNewUserProfile, SYSTEM_USER_HEADER } from '@trz-api/controllers/userController';
import {
    createUserHeaderDb,
    getUserHeaderByIdDb,
    getUserHeaderByUsernameDb,
    updateUserHeaderDb,
} from '@trz-api/persistence/userPersistence';
import { objectSourceHandlers } from '../dataSourceWrapper';

export const userHandler = objectSourceHandlers(ObjectSource.User, {
    create: async (data) => {
        const newUser: UserHeader = {
            id: crypto.randomUUID(),
            username: await getUniqueUsername(data.username),
            firstName: data.firstName,
            lastName: data.lastName,
            profilePicture: data.profilePicture || '',
        };
        await createUserHeaderDb(newUser);
        await seedNewUserProfile(newUser.id);

        return newUser.id;
    },
    update: async (id, data) => {
        if (data.username) {
            const existingUser = await getUserHeaderByUsernameDb(data.username);
            if (existingUser && existingUser.id !== id) {
                console.error(`Username ${data.username} is already taken by another user.`);
                delete data.username; // Remove username, but allow other fields to be updated
            }
        }
        await updateUserHeaderDb(id, data);
    },
    read: async (id) => {
        if (id === SYSTEM_USER_ID) {
            return SYSTEM_USER_HEADER;
        }
        return (await getUserHeaderByIdDb(id)) || undefined;
    },
});
