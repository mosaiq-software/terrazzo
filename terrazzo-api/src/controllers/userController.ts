import { generateUsernameDiscriminator, SYSTEM_USER_ID, UserHeader, UserId } from '@mosaiq/terrazzo-common';
import { syncUpdateUserField } from '@trz-api/broadcasters';
import {
    createUserHeaderDb,
    getUserHeaderByIdDb,
    getUserHeaderByUsernameDb,
    updateUserHeaderDb,
} from '@trz-api/persistence/userPersistence';
import { isDev } from '@trz-api/utils/envUtils';
import { addBoard } from './boardController/boardController';
import { addCard } from './cardController';
import { addList } from './listController';
import { addOrganization } from './organizationController';

export async function checkUsernameTaken(username: string) {
    const user = await getUserHeaderByUsernameDb(username);
    return !!user;
}

export async function createNewUser(username: string, firstName: string, lastName: string, profilePicture: string) {
    let maxAttempts = 100;
    let discriminator = '';
    while ((await checkUsernameTaken(`${username}${discriminator}`)) && maxAttempts > 0) {
        discriminator = generateUsernameDiscriminator();
        maxAttempts--;
    }
    if (maxAttempts === 0) {
        throw new Error('Failed to generate unique username');
    }

    const newUser: UserHeader = {
        id: crypto.randomUUID(),
        username: `${username}${discriminator}`,
        firstName: firstName,
        lastName: lastName,
        profilePicture: profilePicture,
    };

    try {
        await createUserHeaderDb(newUser);
    } catch (e) {
        throw new Error('Failed to create user' + e);
    }

    await seedNewUserProfile(newUser.id);

    return newUser;
}

const seedNewUserProfile = async (userId: UserId) => {
    // create a default personal org for the user to have projects in
    try {
        const user = await getUserHeader(userId);
        if (!user) {
            throw new Error(`Could not find seedable user: ${userId}`);
        }
        const personalOrgId = await addOrganization({
            name: `${user.firstName}'s Space`,
            description: 'A place to keep your personal projects',
            logoUrl: user.profilePicture,
            ownerId: user.id,
        });
        const personalBoardId = await addBoard('Task Tracking', '', personalOrgId);
        const personalListTodo = await addList({ boardId: personalBoardId, name: 'To Do' });
        const personalListDoing = await addList({ boardId: personalBoardId, name: 'Doing' });
        const personalListDone = await addList({ boardId: personalBoardId, name: 'Done' });
        const cards = {
            '👓 Create a Terrazzo account': personalListDone.id,
            '🔎 Explore Terrazzo!': personalListDoing.id,
            '📃 Add a card to a list': personalListTodo.id,
            '🧱 Start my own project': personalListTodo.id,
            '😀 Invite some friends': personalListTodo.id,
        };
        for (const [cardName, listId] of Object.entries(cards)) {
            await addCard({
                listId: listId,
                name: cardName,
                createdById: SYSTEM_USER_ID,
            });
        }
    } catch (e) {
        console.error(e);
        throw new Error('Failed to create users personal organization ' + e);
    }
};

const SYSTEM_USER_HEADER: UserHeader = {
    id: SYSTEM_USER_ID,
    username: 'system',
    firstName: 'System',
    lastName: 'User',
    profilePicture: '',
};
export const getUserHeader = async (userId: UserId) => {
    if (userId === SYSTEM_USER_ID) {
        return SYSTEM_USER_HEADER;
    }
    const user = await getUserHeaderByIdDb(userId);
    if (!user) {
        throw new Error('No user found');
    }
    return user;
};

export const updateUserData = async (userData: Partial<UserHeader> & { id: UserId }) => {
    // Check username uniqueness if it's being updated
    if (userData.username) {
        const existingUser = await getUserHeaderByUsernameDb(userData.username);
        if (existingUser && existingUser.id !== userData.id) {
            console.error(`Username ${userData.username} is already taken by another user.`);
            delete userData.username; // Remove username, but allow other fields to be updated
        }
    }

    await updateUserHeaderDb(userData);
    await syncUpdateUserField(userData.id, userData);
};

export const DEV_upsertFakeUser = async (username: string): Promise<UserHeader> => {
    if (!isDev()) {
        throw new Error('upsertFakeUser cannot be used outside of the dev environment');
    }

    let user = await getUserHeaderByUsernameDb(username);
    if (!user) {
        const randomId = crypto.randomUUID();
        const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];
        const lastNames = [
            'Anderson',
            'Brown',
            'Clark',
            'Davis',
            'Evans',
            'Franklin',
            'Garcia',
            'Harris',
            'Ivanov',
            'Johnson',
        ];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const profilePicture = `https://i.pravatar.cc/150?u=${randomId}`;
        const fakeUser = await createNewUser(username, firstName, lastName, profilePicture);
        user = fakeUser;
    }
    if (!user) {
        throw new Error('Failed to upsert dev user');
    }
    return user;
};
