import { UID } from '../genericTypes';
import { Label } from '../modules/board/labelTypes';

interface BaseObjectSource {
    id: UID;
}

export enum ObjectSource {
    Card = 'Card',
    Label = 'Label',
}

export interface ObjectSourcesMap {
    [ObjectSource.Card]: {
        create: CreateCard;
        update: UpdateCard;
        data: Card;
    };
    [ObjectSource.Label]: {
        create: CreateLabel;
        update: UpdateLabel;
        data: Label;
    };
}
