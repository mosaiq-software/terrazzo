import { isDev } from '@mosaiq/terrazzo-common/utils/envUtils';
import { getAllUsers } from '@trz-api/persistence/userPersistence';
import { createNewUser } from './userController';

const FAKE_USER_PREFIX = 'FAKE_USER_';

export async function DEV_createNewFakeUser() {
    if (!isDev()) {
        throw new Error('Can only create fake users in dev environment');
    }
    const randomId = crypto.randomUUID();
    const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];
    const lastNames = ['Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Franklin', 'Garcia', 'Harris', 'Ivanov', 'Johnson'];
    const username = `user_${randomId.slice(0, 8)}`;
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const profilePicture = `https://i.pravatar.cc/150?u=${randomId}`;
    const githubUserId = `${FAKE_USER_PREFIX}${randomId}`;
    const fakeUser = await createNewUser(username, firstName, lastName, profilePicture, githubUserId);
    return fakeUser;
}

export async function DEV_getAllDevUsers() {
    if (!isDev()) {
        throw new Error('Can only get all users in dev environment');
    }
    const users = await getAllUsers();
    const devUsers = users.filter((user) => user.githubUserId.startsWith(FAKE_USER_PREFIX));
    return devUsers;
}
