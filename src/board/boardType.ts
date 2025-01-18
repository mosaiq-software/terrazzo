import {ListType} from "@trz-api/board/lists/listType";

export interface BoardType {
    // Title, lists, users, data create
    id: string;
    abv: string;
    nextCardNumber: number;
    title: string;
    lists: ListType[]; // 0 through n, 0 being the leftmost and n being the rightmost
    users: string[]; //allowed users
    createdAt: number;
}