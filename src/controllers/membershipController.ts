import { Member, MembershipRecord, OrganizationId, ProjectId, UserId } from '@mosaiq/terrazzo-common/types';
import { getMembershipRecordForEntity } from '@trz-api/persistence/membershipPersistence';
import { getOrgById } from '@trz-api/persistence/organizationPersistence';
import { getProjectById } from '@trz-api/persistence/projectPersistence';
import { populateMemberships } from './userController';

export const getMembersInOrg = async (orgId: OrganizationId) => {
    const org = await getOrgById(orgId);
    if (org == null) {
        throw new Error('Org not found');
    }
    const records = await getMembershipRecordForEntity(orgId);
    const members = populateMemberships(records);
    return members;
};

export const getMembersInJustProject = async (projectId: ProjectId) => {
    const project = await getProjectById(projectId);
    if (project == null) {
        throw new Error('Project not found');
    }
    const records = await getMembershipRecordForEntity(projectId);
    const members = populateMemberships(records);

    return members;
};

export const getMembersInProjectWithOrgDeduped = async (projectId: ProjectId) => {
    const project = await getProjectById(projectId);
    if (project == null) {
        throw new Error('Project not found');
    }
    const orgRecords = await getMembershipRecordForEntity(project.orgId);
    const projectRecords = await getMembershipRecordForEntity(projectId);

    const userRecordMap = new Map<UserId, MembershipRecord>();
    for (const record of orgRecords) {
        userRecordMap.set(record.userId, record);
    }

    for (const record of projectRecords) {
        const existingRecord = userRecordMap.get(record.userId);
        if (existingRecord) {
            if (record.userRole > existingRecord.userRole) {
                userRecordMap.set(record.userId, record);
            }
        } else {
            userRecordMap.set(record.userId, record);
        }
    }
    const deduplicatedRecords = Array.from(userRecordMap.values());
    const members = await populateMemberships(deduplicatedRecords);

    return members;
};
