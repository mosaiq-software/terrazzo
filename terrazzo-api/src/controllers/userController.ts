import {
    generateUsernameDiscriminator,
    ListId,
    recordEntries,
    SYSTEM_USER_ID,
    TrzModule,
    UserHeader,
    UserId,
} from '@mosaiq/terrazzo-common';
import { getUserHeaderByUsernameDb } from '@trz-api/persistence/userPersistence';
import { isDev } from '@trz-api/utils/envUtils';
import { cardHandler } from './dataSources/objectHandlers/card';
import { listHandler } from './dataSources/objectHandlers/list';
import { moduleHandler } from './dataSources/objectHandlers/module';
import { organizationHandler } from './dataSources/objectHandlers/organization';
import { userHandler } from './dataSources/objectHandlers/user';

export async function checkUsernameTaken(username: string) {
    const user = await getUserHeaderByUsernameDb(username);
    return !!user;
}

export async function getUniqueUsername(username: string) {
    let maxAttempts = 100;
    let discriminator = '';
    while ((await checkUsernameTaken(`${username}${discriminator}`)) && maxAttempts > 0) {
        discriminator = generateUsernameDiscriminator();
        maxAttempts--;
    }
    if (maxAttempts === 0) {
        throw new Error('Failed to generate unique username');
    }
    return `${username}${discriminator}`;
}

export const seedNewUserProfile = async (userId: UserId) => {
    // create a default personal org for the user to have projects in
    try {
        const user = await userHandler.read(userId);
        if (!user) {
            throw new Error(`Could not find seedable user: ${userId}`);
        }
        const personalOrgId = await organizationHandler.create({
            name: `${user.firstName}'s Space`,
            description: 'A place to keep your personal projects',
            logoUrl: user.profilePicture,
            ownerId: user.id,
        });

        const personalBoardId = await moduleHandler.create({
            type: TrzModule.Board,
            name: 'Task Tracking',
            parentId: personalOrgId,
            data: {
                boardCode: '',
            },
        });
        const personalListTodoId = await listHandler.create({ boardId: personalBoardId, name: 'To Do' });
        const personalListDoingId = await listHandler.create({ boardId: personalBoardId, name: 'Doing' });
        const personalListDoneId = await listHandler.create({ boardId: personalBoardId, name: 'Done' });
        const cards: Record<string, ListId> = {
            '👓 Create a Terrazzo account': personalListDoneId,
            '🔎 Explore Terrazzo!': personalListDoingId,
            '📃 Add a card to a list': personalListTodoId,
            '🧱 Start my own project': personalListTodoId,
            '😀 Invite some friends': personalListTodoId,
        };
        for (const [cardName, listId] of recordEntries(cards)) {
            await cardHandler.create({
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

export const SYSTEM_USER_HEADER: UserHeader = {
    id: SYSTEM_USER_ID,
    username: 'system',
    firstName: 'System',
    lastName: 'User',
    profilePicture: '',
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
        const fakeUserId = await userHandler.create({
            username,
            firstName,
            lastName,
            profilePicture,
        });
        user = await userHandler.read(fakeUserId);
    }
    if (!user) {
        throw new Error('Failed to upsert dev user');
    }
    return user;
};
