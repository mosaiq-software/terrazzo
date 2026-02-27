import {
    CardId,
    CompoundUID,
    InviteId,
    LabelId,
    ListId,
    ModuleId,
    OrganizationId,
    RoleId,
    TextBlockSnapshotId,
    UserId,
} from '../genericTypes';

export enum CollectionSource {
    // Read only sources
    /** Cards on a list */
    Cards = 'Cards',
    /** Lists on a board */
    Lists = 'Lists',
    /** Labels belonging to a module */
    Labels = 'Labels',
    /** Invites for an organization */
    Invites = 'Invites',
    /** Modules childed by a parent module */
    Modules = 'Modules',
    /** Roles within an organization */
    Roles = 'Roles',
    /** TextBlockSnapshots for a TextBlock */
    TextBlockSnapshots = 'TextBlockSnapshots',
    /** Organizations a user belongs to */
    Organizations = 'Organizations',

    // Editable sources
    /** Users assigned to a card */
    CardAssignees = 'CardAssignees',
    /** Labels assigned to a card */
    LabelAssignments = 'LabelAssignments',
    /** Users belonging to an organization */
    OrganizationMembers = 'OrganizationMembers',
    /** Roles assigned to a user/organization pair */
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
    [CollectionSource.Organizations]: {
        of: OrganizationId;
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
