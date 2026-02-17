import { UID } from '../genericTypes';
import { CreateLabel, Label, UpdateLabel } from '../modules/board/labelTypes';

interface BaseObjectSource {
    id: UID;
}

export enum ObjectSource {
    Label = 'Label',
    // Card = 'Card',
    // Invite = 'Invite',
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
}
