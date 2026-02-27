import {
    CollectionSource,
    CollectionSourceController,
    CollectionSourceEditableHandler,
    CollectionSourceHandler,
    EditableCollectionSource,
    ObjectSource,
    ObjectSourceController,
    ObjectSourceHandler,
} from '@mosaiq/terrazzo-common';
import { cardAssigneesCollectionHandler } from './collectionHandlers/cardAssignees';
import { cardsCollectionHandler } from './collectionHandlers/cards';
import { invitesCollectionHandler } from './collectionHandlers/invites';
import { labelAssignmentsCollectionHandler } from './collectionHandlers/labelAssignments';
import { labelsCollectionHandler } from './collectionHandlers/labels';
import { listsCollectionHandler } from './collectionHandlers/lists';
import { modulesCollectionHandler } from './collectionHandlers/modules';
import { organizationMembersCollectionHandler } from './collectionHandlers/organizationMembers';
import { organizationsCollectionHandler } from './collectionHandlers/organizations';
import { roleAssignmentsCollectionHandler } from './collectionHandlers/roleAssignments';
import { rolesCollectionHandler } from './collectionHandlers/roles';
import { textBlockSnapshotsCollectionHandler } from './collectionHandlers/textBlockSnapshots';
import { cardHandler } from './objectHandlers/card';
import { inviteHandler } from './objectHandlers/invite';
import { labelHandler } from './objectHandlers/label';
import { listHandler } from './objectHandlers/list';
import { moduleHandler } from './objectHandlers/module';
import { organizationHandler } from './objectHandlers/organization';
import { roleHandler } from './objectHandlers/role';
import { textBlockHandler } from './objectHandlers/textBlock';
import { textBlockSnapshotHandler } from './objectHandlers/textBlockSnapshot';
import { userHandler } from './objectHandlers/user';

const objectSourceController: ObjectSourceController = {
    [ObjectSource.Card]: cardHandler,
    [ObjectSource.List]: listHandler,
    [ObjectSource.Label]: labelHandler,
    [ObjectSource.Invite]: inviteHandler,
    [ObjectSource.Module]: moduleHandler,
    [ObjectSource.Organization]: organizationHandler,
    [ObjectSource.Role]: roleHandler,
    [ObjectSource.TextBlock]: textBlockHandler,
    [ObjectSource.TextBlockSnapshot]: textBlockSnapshotHandler,
    [ObjectSource.User]: userHandler,
};

type EditableCollectionSourceHandlers = {
    [T in EditableCollectionSource]: CollectionSourceEditableHandler<T>;
};

const editableCollectionHandlers: EditableCollectionSourceHandlers = {
    [CollectionSource.CardAssignees]: cardAssigneesCollectionHandler,
    [CollectionSource.LabelAssignments]: labelAssignmentsCollectionHandler,
    [CollectionSource.OrganizationMembers]: organizationMembersCollectionHandler,
    [CollectionSource.RoleAssignments]: roleAssignmentsCollectionHandler,
};

const collectionSourceController: CollectionSourceController = {
    [CollectionSource.Cards]: cardsCollectionHandler,
    [CollectionSource.Lists]: listsCollectionHandler,
    [CollectionSource.Labels]: labelsCollectionHandler,
    [CollectionSource.Invites]: invitesCollectionHandler,
    [CollectionSource.Modules]: modulesCollectionHandler,
    [CollectionSource.Roles]: rolesCollectionHandler,
    [CollectionSource.TextBlockSnapshots]: textBlockSnapshotsCollectionHandler,
    [CollectionSource.Organizations]: organizationsCollectionHandler,
    [CollectionSource.CardAssignees]: cardAssigneesCollectionHandler,
    [CollectionSource.LabelAssignments]: labelAssignmentsCollectionHandler,
    [CollectionSource.OrganizationMembers]: organizationMembersCollectionHandler,
    [CollectionSource.RoleAssignments]: roleAssignmentsCollectionHandler,
};

export const getObjectHandler = <T extends ObjectSource>(type: T): ObjectSourceHandler<T> => {
    return objectSourceController[type];
};

export const getCollectionHandler = <T extends CollectionSource>(type: T): CollectionSourceHandler<T> => {
    return collectionSourceController[type];
};

export const getEditableCollectionHandler = <T extends EditableCollectionSource>(
    type: T
): CollectionSourceEditableHandler<T> => {
    return editableCollectionHandlers[type];
};
