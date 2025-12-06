import { CardId, InviteId } from '@mosaiq/terrazzo-common';

export const getInviteLink = (inviteId: InviteId) => {
    return `${window.location.origin}/invite/${inviteId}`;
};

export const getCardLink = (cardId: CardId) => {
    return `${window.location.origin}/card/${cardId}`;
};
