import {
    createCardOnList,
    getCardsByListIdDown,
    getCardsByListIdShort,
    updateName,
} from "@trz-api/persistence/cardPersistence";
import {getListById} from "@trz-api/persistence/listPersistence";
import {getBoardById, updateBoard} from "@trz-api/persistence/boardPersistence";
import {Card, ListId, Priority} from "@mosaiq/terrazzo-common/types";
import { createTextBlock } from "@trz-api/persistence/textBlockPersistence";

//Gets

/**
 * Gets all cards of a list by list ID
 * All cards are returned with all their labels, checklists, comments, and timesheet entries
 * Returns a promise of all cards in the list
 * @param listID
 */
export async function getAllCardsOfList(listID: ListId) {
    const cards = await getCardsByListIdShort(listID);

    if(cards == null) {
        return [];
    }

    try {
        return cards;
    } catch (e) {
        throw new Error("Failed to retrieve board" + e);
    }
}

//Creates

/**
 * Adds an empty card to an existing list via the list ID
 * You must pass in the list ID and the card name
 * Returns the ID of the new card
 * @param listID
 * @param cardName
 */
export async function addCard(listID:ListId, cardName:string) {
    //pull board from db with ID
    const updatingList = await getListById(listID);

    if (updatingList == null) {
        throw new Error("Board not found");
    }

    const board = await getBoardById(updatingList.boardId);

    if (board == null) {
        throw new Error("Board not found");
    }

    const cardUid = crypto.randomUUID();
    const newCard: Card = {
        id:cardUid,
        listId:listID,
        cardNumber:(board.totalCards + 1),
        name:cardName,
        descriptionTextBlockId: '',
        priority:Priority.LOWEST,
        storyPoints:0,
        sprintId:"",
        assignees:[],
        comments:[],
        labels:[],
        archived:false,
        order: await getNextCardOrder(listID)
    };
    try {
        const descBlock = await createTextBlock("", cardUid);
        if(!descBlock){
            throw new Error("Failed to create description text block");
        }
        newCard.descriptionTextBlockId = descBlock.id;
    } catch (error:any) {
        throw new Error("Failed to create description text block");
    }

    try {
        await createCardOnList(newCard, listID);
        board.totalCards++;
        await updateBoard(board);
        return newCard;
    }catch (e) {
        throw new Error("Failed to save Card" + e);
    }
}

//Updates

/**
 * Updates the name of a card
 * You must pass in the card ID and the new name
 * Returns true if successful
 * @param cardID
 * @param name
 */
export async function editName(cardID:string, name:string) {

    //Add any checks here for any future use
    try {
        await updateName(cardID, name);
        return true;
    }catch (e) {
        throw new Error("Failed to save Card" + e);
    }
}

export const getNextCardOrder = async (listId: ListId) => {
    const card = await getCardsByListIdDown(listId);
    return card ? card.length + 1 : 1;
}