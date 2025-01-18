import {CardType} from "@trz-api/board/card/CardType";

export interface ListType {
    title: string;
    cards: CardType[]; // 0 through n, 0 being the top and n being the bottom
}