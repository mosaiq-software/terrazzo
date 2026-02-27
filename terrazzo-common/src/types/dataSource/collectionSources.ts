import {
    CardId,
    CompoundUID,
    InviteId,
    LabelId,
    ListId,
    ModuleId,
    RoleId,
    TextBlockSnapshotId,
    UserId,
} from '../genericTypes';

export enum CollectionSource {
    // Read only sources
    Cards = 'Cards',
    Lists = 'Lists',
    Labels = 'Labels',
    Invites = 'Invites',
    Modules = 'Modules',
    Roles = 'Roles',
    TextBlockSnapshots = 'TextBlockSnapshots',

    // Editable sources
    CardAssignees = 'CardAssignees',
    LabelAssignments = 'LabelAssignments',
    OrganizationMembers = 'OrganizationMembers',
    RoleAssignments = 'RoleAssignments',
}

export interface CollectionSourceDataMap {
    // Read only sources
    [CollectionSource.Cards]: {
        of: CardId;
        editable: false;
    };
    [CollectionSource.Lists]: {
        of: ListId;
        editable: false;
    };
    [CollectionSource.Labels]: {
        of: LabelId;
        editable: false;
    };
    [CollectionSource.Invites]: {
        of: InviteId;
        editable: false;
    };
    [CollectionSource.Modules]: {
        of: ModuleId;
        editable: false;
    };
    [CollectionSource.Roles]: {
        of: RoleId;
        editable: false;
    };
    [CollectionSource.TextBlockSnapshots]: {
        of: TextBlockSnapshotId;
        editable: false;
    };

    // Editable sources
    [CollectionSource.CardAssignees]: {
        of: CardId;
        editable: true;
    };
    [CollectionSource.LabelAssignments]: {
        of: LabelId;
        editable: true;
    };
    [CollectionSource.OrganizationMembers]: {
        of: UserId;
        editable: true;
    };
    [CollectionSource.RoleAssignments]: {
        of: RoleId;
        editable: true;
        key: CompoundUID;
    };
}
