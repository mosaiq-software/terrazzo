import { EntityType } from '@mosaiq/terrazzo-common/constants';
import { BoardId, List, Member, MembershipRecord, MembershipRecordId, OrganizationId, ProjectId, UserDash, UserHeader, UserId } from '@mosaiq/terrazzo-common/types';
import { deleteMembershipRecord, getMembershipById, getMembershipRecordsForUser, updateMembershipRecord } from '@trz-api/persistence/membershipPersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { getProjectById, getProjectsByOrgId } from '@trz-api/persistence/projectPersistence';
import { createUser, getUserByGithubId, getUserById, getUserByUsername, updateUser } from '@trz-api/persistence/userPersistence';
import { getPrivateGitHubUserData, getPublicGithubUserDataFromGithubUserId } from '@trz-api/utils/githubUtils';
import { getInvitesToUser } from './inviteController';
import { addOrganization, updateOrganizationFromPartial } from './organizationController';
import { addProject } from './projectController';
import { addBoard } from './boardController';
import { addList, getListAndCardIdsOnBoard } from './listController';
import { addCard } from './cardController';
import { updateBaseFromPartial } from '@mosaiq/terrazzo-common/utils/arrayUtils';
import { getMembersInOrg } from './membershipController';
import { getBoardsByProjectId } from '@trz-api/persistence/boardPersistence';

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

//Creates
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

//Updates

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
        await updateOrganizationFromPartial(personalOrgId, { logoUrl: user.profilePicture, description: 'A place to keep your personal projects' });
        const personalProjectId: ProjectId = await addProject('My First Project', personalOrgId);
        const personalBoardId: BoardId = await addBoard('Task Tracking', '', personalProjectId);
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

export const getUsersEntities = async (userId: UserId): Promise<UserDash> => {
    try {
        const projectMemberships = (await getMembershipRecordsForUser(userId, EntityType.PROJECT)) ?? [];
        const orgMemberships = (await getMembershipRecordsForUser(userId, EntityType.ORG)) ?? [];

        const standaloneProjects = (
            await Promise.all(
                projectMemberships.map(async (p) => {
                    const project = await getProjectById(p.entityId);
                    if (!project) return null;
                    const members = await getMembersInOrg(project.orgId);
                    return { ...project, members, myMembershipRecord: p };
                })
            )
        ).filter((p) => !!p);

        const organizations = (
            await Promise.all(
                orgMemberships.map(async (o) => {
                    const org = await getOrgById(o.entityId);
                    if (!org) return null;
                    const projects = await getProjectsByOrgId(org.id);
                    const members = await getMembersInOrg(org.id);
                    return { ...org, projects, members, myMembershipRecord: o };
                })
            )
        ).filter((o) => !!o);

        const invites = await getInvitesToUser(userId);

        return { standaloneProjects, organizations, invites };
    } catch (e) {
        console.error(e);
        throw e;
    }
};

export const getUserPreview = async (userId: UserId) => {
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('No user found');
    }
    return user;
};

export async function updateMembershipRecordFromPartial(recordId: MembershipRecordId, partial: Partial<MembershipRecord>) {
    const updatingRecord = await getMembershipById(recordId);
    if (updatingRecord == null) {
        throw new Error('Membership record not found');
    }

    const updated = updateBaseFromPartial<MembershipRecord>(updatingRecord, partial);
    try {
        await updateMembershipRecord(updated);
        return updated;
    } catch (e: any) {
        throw new Error('Failed to update record ' + e);
    }
}

export const removeMembership = async (membershipRecordId: MembershipRecordId): Promise<Member | undefined> => {
    const record = await getMembershipById(membershipRecordId);
    if (!record) {
        throw new Error('Record not found');
    }

    const members = await populateMemberships([record]);
    if (!members || members.length === 0) {
        throw new Error('Couldnt populate records');
    }

    const member = members[0];

    await deleteMembershipRecord(membershipRecordId);
    return member;
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
