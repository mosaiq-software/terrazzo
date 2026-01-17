const SPACING_CHAR = '\u00A0'; // nbsp
export const buildBoardNameVariants = (boardName: string, boardCode: string): string => {
    return [`${boardName} ${boardCode}`, `${boardCode} ${boardName}`, boardName, boardCode, boardCode]
        .join(SPACING_CHAR)
        .toLowerCase();
};

export const buildCardNameVariants = (cardName: string, boardCode: string, cardNumber: number): string => {
    return [
        `[${boardCode}-${cardNumber}] ${cardName}`,
        `${boardCode}-${cardNumber}`,
        `${boardCode}${cardNumber}`,
        `"${boardCode} ${cardNumber}"`,
        `${cardNumber}`,
        `${cardName}`,
    ]
        .join(SPACING_CHAR)
        .toLowerCase();
};

export const buildDocumentNameVariants = (documentName: string): string => {
    return [documentName].join(SPACING_CHAR).toLowerCase();
};

export const buildUserNameVariants = (fullName: string, username: string): string => {
    return [`${fullName} (${username})`, `${username} (${fullName})`, fullName, username, `@${username}`]
        .join(SPACING_CHAR)
        .toLowerCase();
};

export const buildCardNameAndContentVariants = (
    cardName: string,
    boardCode: string,
    cardNumber: number,
    content: string
): string => {
    return [buildCardNameVariants(cardName, boardCode, cardNumber), content.toLowerCase()].join(SPACING_CHAR);
};

export const buildDocumentNameAndContentVariants = (documentName: string, content: string): string => {
    return [buildDocumentNameVariants(documentName), content.toLowerCase()].join(SPACING_CHAR);
};
