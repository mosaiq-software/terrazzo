import { BoardId, List, MembershipRecord, OrganizationId, UserHeader, UserId } from '@mosaiq/terrazzo-common';
import { createOrganizationMembershipDb } from '@trz-api/persistence/organizationMembershipPersistence';
import { createUserHeaderDb, getUserHeaderByIdDb, getUserHeaderByUsernameDb, updateUserHeaderDb } from '@trz-api/persistence/userPersistence';
import { isDev } from '@trz-api/utils/envUtils';
import { addBoard } from './boardController';
import { addCard } from './cardController';
import { addList } from './listController';
import { addOrganization, updateOrganizationFromPartial } from './organizationController';

export async function checkUsernameTaken(username: string) {
    const user = await getUserHeaderByUsernameDb(username);
    return user != null;
}

export async function createNewUser(username: string, firstName: string, lastName: string, profilePicture: string) {
    if (username && (await getUserHeaderByUsernameDb(username)) != null) {
        throw new Error('Username already exists');
    }

    const newUser: UserHeader = {
        id: crypto.randomUUID(),
        username: username,
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
        const user = await getUserHeaderByIdDb(userId);
        if (!user) {
            throw new Error(`Could not find seedable user: ${userId}`);
        }
        const personalOrgId: OrganizationId = await addOrganization(user.firstName + "'s Space", user.id);
        const orgMembershipRecord: MembershipRecord = {
            orgId: personalOrgId,
            userId: user.id,
            joinedAt: Date.now(),
        };
        await createOrganizationMembershipDb(orgMembershipRecord);
        await updateOrganizationFromPartial(personalOrgId, { logoUrl: user.profilePicture, description: 'A place to keep your personal projects' });
        const personalBoardId: BoardId = await addBoard('Task Tracking', '', personalOrgId);
        const personalListTodo: List = await addList(personalBoardId, 'To do');
        const personalListDoing: List = await addList(personalBoardId, 'Doing');
        const personalListDone: List = await addList(personalBoardId, 'Done');
        await addCard(personalListTodo.id, '🔎 Explore Terrazzo!', undefined, undefined, user.id);
        await addCard(personalListTodo.id, '📃 Add a card to a list', undefined, undefined, user.id);
        await addCard(personalListTodo.id, '🧱 Start my own project', undefined, undefined, user.id);
        await addCard(personalListTodo.id, '😀 Invite some friends', undefined, undefined, user.id);
    } catch (e) {
        console.error(e);
        throw new Error('Failed to create users personal organization ' + e);
    }
};

export const getUserPreview = async (userId: UserId) => {
    const user = await getUserHeaderByIdDb(userId);
    if (!user) {
        throw new Error('No user found');
    }
    return user;
};

export const updateUserData = async (userData: Partial<UserHeader> & { id: UserId }) => {
    await updateUserHeaderDb(userData);
};

export const DEV_upsertFakeUser = async (username: string): Promise<UserHeader> => {
    if (!isDev()) {
        throw new Error('upsertFakeUser cannot be used outside of the dev environment');
    }

    let user = await getUserHeaderByUsernameDb(username);
    if (!user) {
        const randomId = crypto.randomUUID();
        const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy'];
        const lastNames = ['Anderson', 'Brown', 'Clark', 'Davis', 'Evans', 'Franklin', 'Garcia', 'Harris', 'Ivanov', 'Johnson'];
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
