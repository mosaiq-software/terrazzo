import { Card, ObjectSource, ObjectSourceHandler, TextBlockId, TrzModule } from '@mosaiq/terrazzo-common';
import { syncAddCard, syncUpdateCardField } from '@trz-api/broadcasters';
import { getModuleById } from '@trz-api/controllers/moduleQueries';
import { createBlocknoteTextBlockWithBlocks } from '@trz-api/controllers/textBlockController/textBlockController';
import {
    createCardOnListDb,
    getCardByIdDb,
    getCardCountOnListDb,
    getTotalCardCountOnBoardDb,
    updateCardDb,
} from '@trz-api/persistence/cardPersistence';
import { getListByIdDb } from '@trz-api/persistence/listPersistence';

export const cardHandler: ObjectSourceHandler<ObjectSource.Card> = {
    create: async (data, options) => {
        const list = await getListByIdDb(data.listId);
        if (!list) {
            throw new Error('List not found');
        }

        const board = await getModuleById(list.boardId, TrzModule.Board);
        if (!board) {
            throw new Error('Board not found');
        }

        let descriptionTextBlockId: TextBlockId;
        try {
            const descBlock = await createBlocknoteTextBlockWithBlocks(data.descriptionBlocks ?? []);
            if (!descBlock) {
                throw new Error('Failed to create description text block');
            }
            descriptionTextBlockId = descBlock.id;
        } catch (error: any) {
            throw new Error('Failed to create description text block');
        }

        const cardsOnBoard = await getTotalCardCountOnBoardDb(board.id);

        const cardUid = crypto.randomUUID();
        const newCard: Card = {
            id: cardUid,
            listId: list.id,
            boardId: board.id,
            cardNumber: data.cardNumber ?? cardsOnBoard + 1,
            name: data.name || '',
            descriptionTextBlockId: descriptionTextBlockId,
            priority: data.priority || null,
            order: data.order !== undefined ? data.order : await getCardCountOnListDb(list.id),
            createdAt: data.createdAt || Date.now(),
            createdById: data.createdById || null,
        };

        try {
            await createCardOnListDb(newCard);
        } catch (e) {
            throw new Error('Failed to save Card' + e);
        }
        if (!options?.preventSync) {
            try {
                await syncAddCard(newCard, board.id);
            } catch (e) {
                throw new Error('Failed to sync Card' + e);
            }
        }
        return newCard.id;
    },
    update: async (id, data, options) => {
        try {
            await updateCardDb(id, data);
        } catch (e: any) {
            throw new Error('Failed to update card ' + e);
        }
        if (!options?.preventSync) {
            try {
                const card = await getCardByIdDb(id);
                if (!card) {
                    throw new Error('Card not found after update ' + id);
                }
                await syncUpdateCardField(card, card.boardId);
            } catch (e) {
                throw new Error('Failed to sync updated card ' + e);
            }
        }
    },
    read: async (id) => {
        return (await getCardByIdDb(id)) || undefined;
    },
};
