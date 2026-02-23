import {
    CreateOrganizationHeader,
    CreateRole,
    CreateTextBlock,
    CreateUserHeader,
    OrganizationHeader,
    Role,
    TextBlock,
    UpdateOrganizationHeader,
    UpdateRole,
    UpdateTextBlock,
    UpdateUserHeader,
    UserHeader,
} from '../..';
import { CreateInvite, Invite, UpdateInvite } from '../inviteTypes';
import { Card, CreateCard, UpdateCard } from '../modules/board/cardTypes';
import { CreateLabel, Label, UpdateLabel } from '../modules/board/labelTypes';
import { CreateList, List, UpdateList } from '../modules/board/listTypes';
import { CreateModuleHeader, ModuleHeader, UpdateModuleHeader } from '../modules/moduleTypes';
import { CreateTextBlockSnapshot, TextBlockSnapshot, UpdateTextBlockSnapshot } from '../textSnapshotTypes';

export enum ObjectSource {
    Card = 'Card',
    List = 'List',
    Label = 'Label',
    Invite = 'Invite',
    Module = 'Module',
    Organization = 'Organization',
    Role = 'Role',
    TextBlock = 'TextBlock',
    TextBlockSnapshot = 'TextBlockSnapshot',
    User = 'User',
}

export interface ObjectSourcesMap {
    [ObjectSource.Card]: {
        create: CreateCard;
        update: UpdateCard;
        data: Card;
    };
    [ObjectSource.List]: {
        create: CreateList;
        update: UpdateList;
        data: List;
    };
    [ObjectSource.Label]: {
        create: CreateLabel;
        update: UpdateLabel;
        data: Label;
    };
    [ObjectSource.Invite]: {
        create: CreateInvite;
        update: UpdateInvite;
        data: Invite;
    };
    [ObjectSource.Module]: {
        create: CreateModuleHeader;
        update: UpdateModuleHeader;
        data: ModuleHeader;
    };
    [ObjectSource.Organization]: {
        create: CreateOrganizationHeader;
        update: UpdateOrganizationHeader;
        data: OrganizationHeader;
    };
    [ObjectSource.Role]: {
        create: CreateRole;
        update: UpdateRole;
        data: Role;
    };
    [ObjectSource.TextBlock]: {
        create: CreateTextBlock;
        update: UpdateTextBlock;
        data: TextBlock;
    };
    [ObjectSource.TextBlockSnapshot]: {
        create: CreateTextBlockSnapshot;
        update: UpdateTextBlockSnapshot;
        data: TextBlockSnapshot;
    };
    [ObjectSource.User]: {
        create: CreateUserHeader;
        update: UpdateUserHeader;
        data: UserHeader;
    };
}
