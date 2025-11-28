import { BoardId, List, Member, MembershipRecord, OrganizationId, OrgMembershipLevel, UserHeader, UserId } from '@mosaiq/terrazzo-common/types';
import { upsertOrganizationMembership } from '@trz-api/persistence/organizationMembershipPersistence';
import { createUser, getUserByGithubId, getUserById, getUserByUsername, updateUser } from '@trz-api/persistence/userPersistence';
import { getPrivateGitHubUserData, getPublicGithubUserDataFromGithubUserId } from '@trz-api/utils/githubUtils';
import { addBoard } from './boardController';
import { addCard } from './cardController';
import { addList } from './listController';
import { addOrganization, updateOrganizationFromPartial } from './organizationController';

//Gets
export async function getOrCreateUserByGithubAccessToken(accessToken: string) {
    const githubData = await getPrivateGitHubUserData(accessToken);
    if (!githubData) {
        throw new Error('Cant find an account with that access token');
    }
    let user = await getUserByGithubId(githubData.id);

    try {
        if (user == null) {
            user = await createNewUser('', '', '', '', githubData.id);
            return user;
        }

        return user;
    } catch (e) {
        throw new Error('Failed to retrieve user' + e);
    }
}

export async function checkUsernameTaken(username: string) {
    const user = await getUserByUsername(username);
    return user != null;
}

export async function createNewUser(username: string, firstName: string, lastName: string, profilePicture: string, githubUserId: string) {
    if (username.length > 13) {
        throw new Error('Username must be 13 characters or less');
    }
    if ((await getUserByUsername(username)) != null) {
        throw new Error('Username already exists');
    }

    const ghProfile = await getPublicGithubUserDataFromGithubUserId(githubUserId);

    const newUser: UserHeader = {
        id: crypto.randomUUID(),
        username: username || '',
        firstName: firstName,
        lastName: lastName,
        profilePicture: profilePicture || ghProfile?.avatar_url || '',
        githubUserId: githubUserId,
    };

    try {
        await createUser(newUser);
    } catch (e) {
        throw new Error('Failed to create user' + e);
    }

    return newUser;
}

export async function setupUser(userId: UserId, username: string, firstName: string, lastName: string) {
    const user = await getUserById(userId);

    if (user == null) {
        throw new Error('User not found');
    }

    user.username = username;
    user.firstName = firstName;
    user.lastName = lastName;

    try {
        await updateUser(user);
    } catch (e) {
        throw new Error('Failed to update user' + e);
    }

    // create a default personal org for the user to have projects in
    try {
        const personalOrgId: OrganizationId = await addOrganization(firstName + "'s Space", user.id, true);
        const orgMembershipRecord: MembershipRecord = {
            orgId: personalOrgId,
            userId: user.id,
            permissionLevel: OrgMembershipLevel.ADMIN,
        };
        await upsertOrganizationMembership(orgMembershipRecord);
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
        throw new Error('Failed to create users personal organization ' + e);
    }

    return user;
}

export const getUserPreview = async (userId: UserId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('No user found');
    }
    return user;
};

export const populateMemberships = async (records: MembershipRecord[]) => {
    const members = (
        await Promise.all(
            records.map(async (r) => {
                return {
                    record: r,
                    user: await getUserById(r.userId),
                };
            })
        )
    ).filter((m) => !!m.user) as Member[];
    return members;
};
