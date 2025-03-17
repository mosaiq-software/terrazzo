import {
    createCardOnList,
    getCardById,
    getCardsByListIdDown,
    getCardsByListIdShortUp,
    getCardsByListIdUp,
    updateCard,
    updateCardList,
    updateCardOrder,
} from "@trz-api/persistence/cardPersistence";
import {getListById, getNextListOrder} from "@trz-api/persistence/listPersistence";
import {getBoardById, updateBoard} from "@trz-api/persistence/boardPersistence";
import {BoardId, Card, CardHeader, CardId, ListId} from "@mosaiq/terrazzo-common/types";
import { createTextBlock } from "@trz-api/persistence/textBlockPersistence";
import { updateBaseFromPartial } from "@mosaiq/terrazzo-common/utils/arrayUtils";
import { getAssignmentsForCard } from "@trz-api/persistence/assignmentPersistence";

export const MOVING_LIST_ORDER = -10000;
//Gets

/**
 * Gets all cards of a list by list ID
 * All cards are returned with all their labels, checklists, comments, and timesheet entries
 * Returns a promise of all cards in the list
 * @param listID
 * @param archived
 */
export async function getAllCardsOfList(listID: ListId, archived: boolean) {
    let cardHeaders = await getCardsByListIdShortUp(listID, archived);

    if(cardHeaders == null) {
        return [];
    }

    cardHeaders = cardHeaders.filter(c=>!c.archived);

    const cards = await populateCards(cardHeaders);

    try {
        return cards;
    } catch (e) {
        throw new Error("Failed to retrieve board" + e);
    }
}

export async function getCardIdsOnList(listID: ListId, archived: boolean): Promise<CardId[]> {
    const cardHeaders = await getCardsByListIdShortUp(listID, archived);
    if(cardHeaders == null) {
        return [];
    }
    return cardHeaders.map(c=>c.id);
}

export async function getSingleFullCard (cardId: CardId): Promise<Card | undefined> {
    const cardHeader = await getCardById(cardId);
    if(!cardHeader){
        throw new Error("Card not found");
    }
    const card = (await populateCards([cardHeader])??[undefined])[0] ?? undefined;
    return card;
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
        descriptionTextBlockId: cardUid, // placeholder id
        priority:null,
        storyPoints:null,
        sprintId:"",
        assignees:[],
        comments:[],
        labels:[],
        archived:false,
        order: await getNextCardOrder(listID)
    };
    try {
        const descBlock = await createTextBlock();
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

export async function updateCardFromPartial(cardId: CardId, partial:Partial<CardHeader>) {
    const updatingCard = await getCardById(cardId);
    if (updatingCard == null) {
        throw new Error("Card not found");
    }

    const updated = updateBaseFromPartial<CardHeader>(updatingCard, partial);
    try {
        await updateCard(updated);
    } catch (e:any) {
        throw new Error("Failed to update card "+e);
    }
}

export const getNextCardOrder = async (listId: ListId) => {
    const card = await getCardsByListIdDown(listId);
    return card ? card.length + 1 : 1;
}

//Utils

export async function getListIDFromCardID(cardID:CardId) {
    const card = await getCardById(cardID);
    if (card == null) {
        throw new Error("Card not found");
    }
    return card.listId;
}

export async function getBoardIDFromCardID(cardID:CardId) {
    const card = await getCardById(cardID);
    if (card == null || !card.listId) {
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
export async function moveCardToList(cardId: CardId, toListId:ListId, position?:number) {
    try {
        const card = await getCardById(cardId);
        if(!card){
            throw new Error(`Card ${cardId} not found`);
        }
        let currentListCards = await getCardsByListIdShortUp(card.listId, false);
        if(!currentListCards){
            throw new Error(`Current list ${card.listId} not found`);
        }
        let newListCards = await getCardsByListIdShortUp(toListId, false);
    
        currentListCards = currentListCards.filter(c=>c.id!==cardId);
        
        if(card.listId === toListId){
            newListCards = currentListCards;
        }
        if(!newListCards){
            throw new Error(`New list ${toListId} not found`);
        }

        if(position !== undefined){
			newListCards.splice(position, 0, card);
		} else{
			newListCards.push(card);
		}

        const promises = [];
        for(let i = 0; i < currentListCards.length; i++) {
            currentListCards[i].order = i;
            promises.push(updateCardOrder(currentListCards[i].id, i));
        }
        if(toListId !== card.listId){
            for(let i = 0; i < newListCards.length; i++) {
                newListCards[i].order = i;
                promises.push(updateCardOrder(newListCards[i].id, i));
            }
            promises.push(updateCardList(cardId, toListId));
        }
        await Promise.all(promises);
    } catch (error: any) {
        console.error(`Error moving card ${cardId} to list ${toListId}: ${error}`);
        throw error;
    }
}

export const populateCards = async (cardHeaders:CardHeader[]): Promise<Card[]> => {
    return await Promise.all(cardHeaders.map(async (c:CardHeader)=>{
        const cc:Card = {
            ...c,
            assignees: await getAssignmentsForCard(c.id),
            labels: [],
            comments: [],
        };
        return cc;
    }));
}