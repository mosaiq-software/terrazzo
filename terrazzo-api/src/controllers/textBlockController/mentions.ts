import { createInlineContentSpec } from '@blocknote/core';
import {
    QueryableItem,
    TrzModule,
    UID,
    boardNameWithCode,
    cardNameWithBoardCodeAndNumber,
    exhaustiveCheck,
    fullNameWithUsername,
} from '@mosaiq/terrazzo-common';
import { getCardByIdDb } from '@trz-api/persistence/cardPersistence';
import { getModuleById } from '../moduleController';
import { getUserHeader } from '../userController';

/**
 * Random string that is extremely unlikely to appear in normal text.
 * DO NOT CHANGE THIS! IT WILL BREAK EXISTING MENTIONS IN SAVED TEXT BLOCKS!
 */
const mentionEncodings = {
    delimiter: '3fu8h3490fh302hf08ug2308hf4tn453o8hqo4iha1awd543g5yb356',
    identifier: 'MENTION_ENCODED=======',
    innerDelimiter: ':::',
};

/**
 * Mentions need to be encoded in a way that they can be stored in the text content, then dynamically decoded and fetched on render.
 */
const encodedMention = (id: string, type: string): string => {
    return `${mentionEncodings.delimiter}${mentionEncodings.identifier}${mentionEncodings.innerDelimiter}${type}${mentionEncodings.innerDelimiter}${id}${mentionEncodings.delimiter}`;
};

/**
 * Replaces all encoded mentions in the given text using the provided asynchronous replacement function.
 * @param rawText The text containing encoded mentions
 * @param replaceFn Function that takes an id and type, and returns a Promise resolving to the replacement string
 * @returns A Promise resolving to the text with all encoded mentions replaced
 */
export const replaceEncodedMentionsInText = async (
    rawText: string,
    replaceFn: (id: UID, type: QueryableItem) => Promise<string>
): Promise<string> => {
    const pattern = new RegExp(
        `${mentionEncodings.delimiter}${mentionEncodings.identifier}${mentionEncodings.innerDelimiter}(\\w+)${mentionEncodings.innerDelimiter}([\\w-]+)${mentionEncodings.delimiter}`,
        'g'
    );

    // Asynchronously process all matches
    const segments: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(rawText)) !== null) {
        const precedingText = rawText.substring(lastIndex, match.index);
        segments.push(precedingText);
        const type = match[1] as QueryableItem;
        const id = match[2] as UID;
        if (!type || !id) {
            console.error('Invalid encoded mention format', { match, p1: match[1], p2: match[2] });
            segments.push(match[0]); // Push the original match if parsing fails
        } else {
            const replacement = await replaceFn(id, type);
            segments.push(replacement);
        }
        lastIndex = match.index + match[0].length;
    }
    segments.push(rawText.substring(lastIndex));
    return segments.join('');
};

export const BlockNoteMention = createInlineContentSpec(
    {
        type: 'mention',
        content: 'none',
        propSchema: {
            id: {
                default: '',
            },
            type: {
                default: '',
            },
        },
    },
    {
        render: (inlineContent) => {
            const serverSideHtml = document.createElement('span');
            serverSideHtml.className = 'bn-mention';
            const id = inlineContent?.props?.id || '';
            const type = inlineContent?.props?.type || '';
            serverSideHtml.textContent = encodedMention(id, type);
            serverSideHtml.setAttribute('data-mention-id', id);
            return { dom: serverSideHtml };
        },
    }
);

/**
 * Retrieves the display text for a mention based on its ID and type.
 * @param id The unique identifier of the mention
 * @param type The type of the mention (e.g., User, Card, Document, Board)
 * @returns The display text for the mention or undefined if not found
 */
export const retrieveMentionDisplayText = async (id: UID, type: QueryableItem): Promise<string | undefined> => {
    switch (type) {
        case QueryableItem.User: {
            const userHeader = await getUserHeader(id);
            return userHeader ? fullNameWithUsername(userHeader) : undefined;
        }
        case QueryableItem.Card: {
            const card = await getCardByIdDb(id);
            if (!card) {
                return undefined;
            }
            const boardModule = await getModuleById(card.boardId, TrzModule.Board);
            return cardNameWithBoardCodeAndNumber(card.name, boardModule?.data.boardCode, card.cardNumber);
        }
        case QueryableItem.Document: {
            const documentModule = await getModuleById(id, TrzModule.Document);
            return documentModule ? documentModule.name : ``;
        }
        case QueryableItem.Board: {
            const boardModule = await getModuleById(id, TrzModule.Board);
            return boardModule ? boardNameWithCode(boardModule.name, boardModule?.data.boardCode) : undefined;
        }
        default:
            exhaustiveCheck(type, `Unsupported mention type ${type}`);
    }
};
