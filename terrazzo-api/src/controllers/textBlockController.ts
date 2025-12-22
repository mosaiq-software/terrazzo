import { TextBlockId, UserId } from '@mosaiq/terrazzo-common';
import { getCardsByDescriptionTextBlockIdDb } from '@trz-api/persistence/cardPersistence';
import { getDocumentsByTextBlockIdDb } from '@trz-api/persistence/documentPersistence';
import { createTextBlockDb, getTextBlockByIdDb, writeTextBlockDb } from '@trz-api/persistence/textBlockPersistence';
import { userCanEditCard, userCanEditDocument } from '@trz-api/utils/permissions';
import { getBoardIDFromCardID } from './cardController';

export const checkCanUserEditTextBlock = async (userId: UserId | undefined, textBlockId: TextBlockId): Promise<boolean> => {
    const relevantCards = await getCardsByDescriptionTextBlockIdDb(textBlockId);
    if (relevantCards.length > 1) {
        throw new Error(`Text block ${textBlockId} is associated with multiple cards, cannot determine edit permissions.`);
    }
    if (relevantCards.length === 1) {
        const card = relevantCards[0];
        const boardId = await getBoardIDFromCardID(card.id);
        const canEditCard = await userCanEditCard(userId, boardId);
        return canEditCard;
    }

    const relevantDocs = await getDocumentsByTextBlockIdDb(textBlockId);
    if (relevantDocs.length > 1) {
        throw new Error(`Text block ${textBlockId} is associated with multiple documents, cannot determine edit permissions.`);
    }
    if (relevantDocs.length === 1) {
        const doc = relevantDocs[0];
        const canEditDoc = await userCanEditDocument(userId, doc.id);
        return canEditDoc;
    }

    throw new Error(`Text block ${textBlockId} is not associated with any cards or documents, cannot determine edit permissions.`);
};

export const storeTextBlockEncodedData = async (_textBlockId: TextBlockId, data: string) => {
    let textBlockId = (await getTextBlockByIdDb(_textBlockId))?.id;
    if (!textBlockId) {
        textBlockId = (await createTextBlockDb(data)).id;
    }
    if (!textBlockId) {
        throw new Error(`Unable to find or create text block ${_textBlockId}`);
    }

    try {
        await writeTextBlockDb(textBlockId, data);
    } catch (error: any) {
        console.error('Unable to save text block ' + textBlockId + ' : ' + error.message);
        throw new Error('Unable to save text block ' + textBlockId + ' : ' + error.message);
    }
};

export const loadTextBlockEncodedData = async (textBlockId: TextBlockId) => {
    try {
        const textBlock = await getTextBlockByIdDb(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }
        const text = textBlock.text;
        if (isValidBase64(text)) {
            return text;
        }
        return text;
    } catch (error: any) {
        console.error(`Unable to load text block ${textBlockId} : ${error.message}`);
        return null;
    }
};

export const createTextBlockWithEncodedData = async (data: string) => {
    try {
        const uid = await createTextBlockDb(data);
        return uid;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};

/**
 * Validates if a string is a valid base64 encoded string
 * @param str The string to validate
 * @returns true if the string is valid base64, false otherwise
 */
export const isValidBase64 = (str: string): boolean => {
    if (!str || typeof str !== 'string') {
        return false;
    }
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(str)) {
        return false;
    }
    if (str.length % 4 !== 0) {
        return false;
    }

    try {
        Buffer.from(str, 'base64');
        const decoded = Buffer.from(str, 'base64');
        const reencoded = decoded.toString('base64');
        return reencoded === str;
    } catch (error) {
        return false;
    }
};
