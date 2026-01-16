const VARIANT_SPACING = 3;
export const buildBoardNameVariants = (boardName: string, boardCode: string): string => {
    return [`${boardName} ${boardCode}`, `${boardCode} ${boardName}`, boardName, boardCode, boardCode]
        .join(' '.repeat(VARIANT_SPACING))
        .toLowerCase();
};

export const buildCardNameVariants = (cardName: string, boardCode: string, cardNumber: number): string => {
    return [
        `[${boardCode}-${cardNumber}] ${cardName}`,
        `${boardCode}-${cardNumber}`,
        `${boardCode}${cardNumber}`,
        `${boardCode} ${cardNumber}`,
        `${cardNumber}`,
        `${cardNumber}`,
        `${cardNumber}`,
        `${cardNumber}`,
        `${cardNumber}`,
        `${cardNumber}`,
        `${cardNumber}`,
        `${cardNumber}`,
        `${cardName}`,
    ]
        .join(' '.repeat(VARIANT_SPACING))
        .toLowerCase();
};

export const buildDocumentNameVariants = (documentName: string): string => {
    return documentName.toLowerCase();
};

export const buildUserNameVariants = (fullName: string, username: string): string => {
    return [`${fullName} (${username})`, `${username} (${fullName})`, fullName, username, `@${username}`]
        .join(' '.repeat(VARIANT_SPACING))
        .toLowerCase();
};

export const buildCardNameAndContentVariants = (
    cardName: string,
    boardCode: string,
    cardNumber: number,
    content: string
): string => {
    return [buildCardNameVariants(cardName, boardCode, cardNumber), content.toLowerCase()].join(
        ' '.repeat(VARIANT_SPACING)
    );
};

export const buildDocumentNameAndContentVariants = (documentName: string, content: string): string => {
    return [buildDocumentNameVariants(documentName), content.toLowerCase()].join(' '.repeat(VARIANT_SPACING));
};
