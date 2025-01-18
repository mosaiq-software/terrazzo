import {LabelType} from "@trz-api/board/card/LabelType";

export interface CardType {
    title: string;
    description: string;
    cardID: string;
    assignedTo: string[]; // userId
    priority: number;
    labels: LabelType[]; // labelId
}
