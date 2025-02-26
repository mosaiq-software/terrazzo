import { getOrgMemberIds, getPrivateGitHubUserData } from "@trz-api/utils/githubUtils";

export const validateGithubAuthToken = async (token: string) => {
    if (!token) {
        throw new Error('No token provided');
    }
    const userData = await getPrivateGitHubUserData(token);
    if (!userData) {
        throw new Error('Invalid token');
    }
    const orgMembers = await getOrgMemberIds(process.env.ORG_NAME!, token);
    if (!orgMembers.includes(userData.id)) {
        throw new Error('User not in organization: ' + process.env.ORG_NAME);
    }
    return userData;
}