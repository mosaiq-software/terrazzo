import {
    createCardOnList,
    getCardsByListIdShort,
    getNextCardOrder,
    updateDescription,
    updateName,
} from "@trz-api/persistence/cardPersistence";
import {getLabelsByBoardId} from "@trz-api/persistence/labelPersistence";
import {getListById} from "@trz-api/persistence/listPersistence";
import {getBoardById, updateBoard} from "@trz-api/persistence/boardPersistence";
import {Card, Priority} from "@mosaiq/terrazzo-common/types";
import { createTextBlock } from "@trz-api/persistence/textBlockPersistence";

//Gets

/**
 * Gets all cards of a list by list ID
 * All cards are returned with all their labels, checklists, comments, and timesheet entries
 * Returns a promise of all cards in the list
 * @param listID
 */
export async function getAllCardsOfList(listID:string) {
    const cards = await getCardsByListIdShort(listID);

    if(cards == null) {
        return [];
    }

    for (const card of cards) {
        card.labels = await getLabelsByBoardId(card.id);
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
export async function addCard(listID:string, cardName:string) {
    //pull board from db with ID
    const updatingList = await getListById(listID);

    if (updatingList == null) {
        throw new Error("Board not found");
    }

    const board = await getBoardById(updatingList.boardId);

    if (board == null) {
        throw new Error("Board not found");
    }

    if(updatingList.cards && updatingList.cards.length > 50) {
        throw new Error("List cannot have more than 50 cards");
    }
    const cardUid = crypto.randomUUID();
    let descriptionTextBlockId;
    try {
        const descBlock = await createTextBlock("", cardUid);
        if(!descBlock){
            throw new Error("Failed to create description text block");
        }
        descriptionTextBlockId = descBlock.id;
    } catch (error:any) {
        throw new Error("Failed to create description text block");
    }

    const newCard: Card = {
        id:cardUid,
        listId:listID,
        cardNumber:(board.totalCards + 1),
        name:cardName,
        descriptionTextBlockId: descriptionTextBlockId,
        priority:Priority.LOWEST,
        storyPoints:0,
        sprintId:"",
        assignees:[],
        comments:[],
        checklists:[],
        labels:[],
        timesheetEntries:[],
        archived:false,
        order:await getNextCardOrder(listID)
    };

    //save board before returning
    //add try statement for error handling
    try {
        await createCardOnList(newCard, listID).then(async () => {
            board.totalCards++;
            await updateBoard(board);
        });
        return newCard;
    }catch (e) {
        throw new Error("Failed to save Card" + e);
    }
}

//Updates

/**
 * Updates the description of a card
 * You must pass in the card ID and the new description
 * Returns true if successful
 * @param cardID
 * @param description
 */
export async function editDescription(cardID:string, description:string) {

    //Add any checks here for any future use
    try {
        await updateDescription(cardID, description);
        return true;
    }catch (e) {
        throw new Error("Failed to save Card" + e);
    }
}


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