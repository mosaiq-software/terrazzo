import {
    createCardOnList,
    getCardById,
    getCardsByListIdShortUp,
    getCardsByListIdUp,
    getNextCardOrder,
    updateCardList,
    updateCardOrder,
    updateDescription,
    updateName,
} from "@trz-api/persistence/cardPersistence";
import {getListById, getNextListOrder} from "@trz-api/persistence/listPersistence";
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
    const cards = await getCardsByListIdShortUp(listID);

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

//Utils

export async function getListIDFromCardID(cardID:string) {
    const card = await getCardById(cardID);
    if (card == null) {
        throw new Error("Card not found");
    }
    return card.listId;
}

export async function getBoardIDFromCardID(cardID:string) {
    const card = await getCardById(cardID);
    if (card == null) {
        throw new Error("Card not found");
    }
    const list = await getListById(card.listId);
    if (list == null) {
        throw new Error("List not found");
    }
    return list.boardId;
}

/*
    Remove the card from its old list and move it to the new one at the position
*/
export async function moveCardToList(cardId: string, toListId:string, position?:number) {
    try {
        if(position === undefined){
            const nextOrder = await getNextListOrder(toListId);
            if(nextOrder == undefined){
                throw new Error(`No next order found on list ${toListId}`);
            }
            position = nextOrder;
         }

         let card: Card | null = await removeCardFromList(cardId);
         if(!card) {
            card = await getCardById(cardId);
            if(!card) {
                throw new Error("Could not find card that was removed!");
            }
        }
        await addCardToList(card.id, toListId, position);
    } catch (error: any) {
        console.error(`Error moving card ${cardId} to list ${toListId}: ${error}`);
        throw error;
    }
}

/** 
    Remove a card from its list and shift the remaining cards in the list down by 1 to preserve order
    @returns the removed card
*/
export const removeCardFromList = async (cardId:string): Promise<Card> => {
    try {
        const remCard = await getCardById(cardId);
        if(!remCard){
            throw new Error("Card not found");
        }
        if(!remCard.listId){
            throw new Error("Card is not assigned to any list");
        }
        const cards = await getCardsByListIdUp(remCard.listId);
        if (!cards || cards.length === 0) {
            throw new Error("List not found");
        }
        const remCardIndex = cards.findIndex(c=>c.id === cardId);
        if(remCardIndex === -1){
            throw new Error("Card not found in list");
        }

        cards.splice(remCardIndex, 1);
        const promises = [updateCardOrder(remCard.id, -1), updateCardList(remCard.id, '')];
        for(let i = 0; i < cards.length; i++) {
            cards[i].order = i;
            promises.push(updateCardOrder(cards[i].id, i));
        }
        await Promise.all(promises);
        return {...remCard, listId: '', order: -1};
    } catch (error: any) {
        console.log(`Error removing card: ${error}`);
        throw error;
    }
}

/**
 * Add a card to a list. The card must not be in any list to allow this to happen
 */
export const addCardToList = async (cardId:string, toList: string, atPosition:number): Promise<void> => {
    try {
        const addCard = await getCardById(cardId);
        if(!addCard){
            throw new Error("Card not found");
        }
        if(addCard.listId){
            throw new Error("Card is already in a list");
        }
        const cards = await getCardsByListIdUp(toList);
        if (!cards) {
            throw new Error("List not found");
        }
        atPosition = Math.max(0, Math.min(atPosition, cards.length));
        cards.splice(atPosition, 0 , addCard);
        const promises = [updateCardList(addCard.id, toList)];
        for(let i = 0; i < cards.length; i++) {
            cards[i].order = i;
            promises.push(updateCardOrder(cards[i].id, i));
        }
        await Promise.all(promises);
    } catch (error: any) {
        console.log(`Error adding card: ${error}`);
        throw error;
    }
}