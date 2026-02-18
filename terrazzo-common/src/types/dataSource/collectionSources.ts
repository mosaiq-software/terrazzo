import { LabelId } from '../genericTypes';

export enum CollectionSource {
    Labels = 'Labels',
    LabelAssignments = 'LabelAssignments',
    // UserAssignments = 'UserAssignments',
    // LinkedAccounts = 'LinkedAccounts',
    // OrganizationMemberships = 'OrganizationMemberships',
    // OrganizationInvites = 'OrganizationInvites',
    // OrganizationRoles = 'OrganizationRoles',
    // RoleAssignments = 'RoleAssignments',
    // TextBlockHistorySnapshots = 'TextBlockHistorySnapshots',
    // BoardLists = 'BoardLists',
    // ListCards = 'ListCards',
}

export interface CollectionSourceDataMap {
    [CollectionSource.Labels]: LabelId[];
    [CollectionSource.LabelAssignments]: LabelId[];
    // [CollectionSource.UserAssignments]: UserId[];
    // [CollectionSource.LinkedAccounts]: LinkedAccount[];
    // [CollectionSource.OrganizationMemberships]: UserId[];
    // [CollectionSource.OrganizationInvites]: InviteId[];
    // [CollectionSource.OrganizationRoles]: RoleId[];
    // [CollectionSource.RoleAssignments]: RoleId[];
    // [CollectionSource.TextBlockHistorySnapshots]: TextBlockSnapshotId[];
    // [CollectionSource.BoardLists]: ListId[];
    // [CollectionSource.ListCards]: CardId[];
}
