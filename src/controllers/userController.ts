import { EntityType } from "@mosaiq/terrazzo-common/constants";
import { UserId } from "@mosaiq/terrazzo-common/types";
import { getMembershipRecordsForUser } from "@trz-api/persistence/membershipPersistence";
import { getOrgById } from "@trz-api/persistence/organizationPersistence";
import { getProjectById } from "@trz-api/persistence/projectPersistence";
import { User } from "@mosaiq/terrazzo-common/types";
import {
    createUser,
    getUserByGithubId,
    getUserById,
    getUserByUsername,
    updateUser
} from "@trz-api/persistence/userPersistence";
import {getPublicGithubUserDataFromGithubUserId} from "@trz-api/utils/githubUtils";

//Gets
export async function getOrCreateUserByGithubId(githubId: string) {
    let user = await getUserByGithubId(githubId);

    try{
        if(user == null) {
            user = await createNewUser("", "", "", "", githubId);
            return user;
        }

        //add workspace and project data here
        /*
        user.workspaces = await getWorkspacesByUserId(user.id);
        user.projects = await getProjectsByUserId(user.id);
         */
        return user;
    }catch (e) {
        throw new Error("Failed to retrieve user" + e);
    }
}

export async function getUser(userID: string) {
    const user = await getUserById(userID);

    if(user == null) {
        throw new Error("User not found");
    }

    try{
        //add workspace and project data here
        /*
        user.workspaces = await getWorkspacesByUserId(user.id);
        user.projects = await getProjectsByUserId(user.id);
         */
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

    const newUser:User = {
        id: crypto.randomUUID(),
        username: username,
        firstName: firstName,
        lastName: lastName,
        profilePicture: profilePicture,
        githubUserId: githubUserId,
        projectIds: [],
        organizationIds: [],
    };

    try {
        await createUser(newUser);
        return newUser;
    } catch (e) {
        throw new Error("Failed to create user" + e);
    }
}

//Updates

export async function setupUser(id: string, username: string, firstName: string, lastName:string) {

    const user = await getUserById(id);

    if(user == null) {
        throw new Error("User not found");
    }

    const githubData = await getPublicGithubUserDataFromGithubUserId(user.githubUserId);

    user.username = username;
    user.firstName = firstName;
    user.lastName = lastName;
    user.profilePicture = githubData.avatar_url;

    try {
        await updateUser(user);
        return user;

    } catch (e) {
        throw new Error("Failed to update user" + e);
    }
}


export const getUsersEntities = async (userId: UserId) => {
    try {
        const projectMemberships = await getMembershipRecordsForUser(userId, EntityType.PROJECT) ?? [];
        const orgMemberships = await getMembershipRecordsForUser(userId, EntityType.ORG) ?? [];

        const projects = (await Promise.all(projectMemberships.map(async (p)=>{
            return getProjectById(p.entityId);
        }))).filter(p=>!!p);

        const organizations = (await Promise.all(orgMemberships.map(async (o)=>{
            return getOrgById(o.entityId);
        }))).filter(o=>!!o);

        return {projects, organizations}
    } catch (e) {
        console.error(e);
        throw e;
    }
}