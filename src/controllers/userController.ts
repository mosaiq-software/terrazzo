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
        workspaceIds: [],
        activeTimerId: "",
        archived: false
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