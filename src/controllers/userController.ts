import { EntityType } from "@mosaiq/terrazzo-common/constants";
import { UserDash, UserHeader, UserId } from "@mosaiq/terrazzo-common/types";
import { getInviteRecordsToUser } from "@trz-api/persistence/invitePersistence";
import { getMembershipRecordsForUser } from "@trz-api/persistence/membershipPersistence";
import { getOrgById } from "@trz-api/persistence/organizationPersistence";
import { getProjectById, getProjectsByOrgId } from "@trz-api/persistence/projectPersistence";
import {
    createUser,
    getUserByGithubId,
    getUserById,
    getUserByUsername,
    updateUser
} from "@trz-api/persistence/userPersistence";
import {getPrivateGitHubUserData, getPublicGithubUserDataFromGithubUserId} from "@trz-api/utils/githubUtils";
import { getInvitesToUser } from "./inviteController";

//Gets
export async function getOrCreateUserByGithubAccessToken(accessToken: string) {
    const githubData = await getPrivateGitHubUserData(accessToken);
    if(!githubData){
        throw new Error("Cant find an account with that access token");
    }
    let user = await getUserByGithubId(githubData.id);

    try{
        if(user == null) {
            user = await createNewUser("", "", "", "", githubData.id);
            return user;
        }

        return user;
    }catch (e) {
        throw new Error("Failed to retrieve user" + e);
    }
}


export async function checkUsernameTaken(username: string) {
    const user = await getUserByUsername(username);
    return user != null;
}


//Creates
export async function createNewUser(username: string, firstName: string, lastName: string, profilePicture: string, githubUserId: string) {

    if(username.length > 13) {
        throw new Error("Username must be 13 characters or less");
    }
    if(await getUserByUsername(username) != null) {
        throw new Error("Username already exists");
    }

    const ghProfile = await getPublicGithubUserDataFromGithubUserId(githubUserId);

    const newUser:UserHeader = {
        id: crypto.randomUUID(),
        username: username || ghProfile?.login || "",
        firstName: firstName,
        lastName: lastName,
        profilePicture: profilePicture || ghProfile?.avatar_url || "",
        githubUserId: githubUserId
    };

    try {
        await createUser(newUser);
        return newUser;
    } catch (e) {
        throw new Error("Failed to create user" + e);
    }
}

//Updates

export async function setupUser(userId: UserId, username: string, firstName: string, lastName:string) {

    const user = await getUserById(userId);

    if(user == null) {
        throw new Error("User not found");
    }

    user.username = username;
    user.firstName = firstName;
    user.lastName = lastName;

    try {
        await updateUser(user);
        return user;

    } catch (e) {
        throw new Error("Failed to update user" + e);
    }
}


export const getUsersEntities = async (userId: UserId): Promise<UserDash> => {
    try {
        const projectMemberships = await getMembershipRecordsForUser(userId, EntityType.PROJECT) ?? [];
        const orgMemberships = await getMembershipRecordsForUser(userId, EntityType.ORG) ?? [];

        const standaloneProjects = (await Promise.all(projectMemberships.map(async (p)=>{
            return getProjectById(p.entityId);
        }))).filter(p=>!!p);

        const organizations = (await Promise.all(orgMemberships.map(async (o)=>{
            const org = await getOrgById(o.entityId);
            if(!org) return null;
            const projects = await getProjectsByOrgId(org.id);
            return {...org, projects};
        }))).filter(o=>!!o);

        const invites = await getInvitesToUser(userId);

        return {standaloneProjects, organizations, invites};
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const getUserPreview = async (userId: UserId) => {
    try {
        const user = await getUserById(userId);
        if(!user){
            throw new Error("No user found");
        }
        return user;
    } catch (e) {
        console.error(e);
        throw e;
    }
}