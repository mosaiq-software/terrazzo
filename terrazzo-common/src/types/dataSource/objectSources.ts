import { UID } from '../genericTypes';
import { CreateInvite, Invite, UpdateInvite } from '../inviteTypes';
import { CreateLabel, Label, UpdateLabel } from '../modules/board/labelTypes';

interface BaseObjectSource {
    id: UID;
}

export enum ObjectSource {
    Label = 'Label',
    Invite = 'Invite',
    // Card = 'Card',
    // List = 'List',
    // Module = 'Module',
    // Organization = 'Organization',
    // Role = 'Role',
    // TextBlock = 'TextBlock',
    // TextBlockSnapshot = 'TextBlockSnapshot',
    // User = 'User',
}

export interface ObjectSourcesMap {
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
}
