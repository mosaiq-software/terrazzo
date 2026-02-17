import { CardHeader, CardId, LabelId, ServerSE, UserId } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { getCardData } from '@trz/emitters';
import { CARD_CACHE_PREFIX } from '@trz/util/boardUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { useSocketListener } from './useSocketListener';

export interface Card extends CardHeader {
    labels: LabelId[];
    assignees: UserId[];
}

export const useCard = (cardId: CardId, cacheCard: boolean, shouldFetch: boolean) => {
    const [card, setCard] = useState<Card | undefined>(undefined);

    const sockCtx = useSocket();

    useEffect(() => {
        const fetchCardData = async () => {
            // Early exit conditions if data is missing
            if (!cardId || !sockCtx.connected || !shouldFetch) {
                return;
            }
            // Avoid redundant fetches
            if (shouldFetch && card && card.id === cardId) {
                return;
            }
            try {
                const cachedCardRes = sessionStorage.getItem(`${CARD_CACHE_PREFIX}${cardId}`);
                if (cacheCard && cachedCardRes) {
                    setCard(JSON.parse(cachedCardRes));
                } else {
                    const cardRes = await getCardData(sockCtx, cardId);
                    setCard(cardRes);
                    if (cardRes && cacheCard) {
                        sessionStorage.setItem(`${CARD_CACHE_PREFIX}${cardId}`, JSON.stringify(cardRes));
                    } else {
                        sessionStorage.removeItem(`${CARD_CACHE_PREFIX}${cardId}`);
                    }
                }
            } catch (err) {
                notify(NoteType.CARD_DATA_ERROR, err);
                return;
            }
        };
        fetchCardData();
    }, [cardId, sockCtx.connected, shouldFetch]);

    useSocketListener(
        ServerSE.UPDATE_CARD_FIELD,
        (payload) => {
            if (payload.id !== cardId) {
                return;
            }
            setCard((prev) => {
                if (!prev) {
                    return prev;
                }
                return { ...prev, ...payload };
            });
        },
        [cardId]
    );

    useSocketListener(
        ServerSE.UPDATE_CARDS_LABELS,
        (payload) => {
            if (payload.cardId !== cardId) {
                return;
            }
            setCard((prev) => {
                if (!prev) {
                    return prev;
                }
                prev.labels = payload.labelIds;
                return { ...prev };
            });
        },
        [cardId]
    );

    useSocketListener(
        ServerSE.UPDATE_CARD_ASSIGNEE,
        (payload) => {
            if (payload.cardId !== cardId) {
                return;
            }
            setCard((prev) => {
                if (!prev) {
                    return prev;
                }
                const assigned = prev.assignees.includes(payload.userId);
                if (payload.assigned && !assigned) {
                    return {
                        ...prev,
                        assignees: [...prev.assignees, payload.userId],
                    };
                }
                if (!payload.assigned && assigned) {
                    return {
                        ...prev,
                        assignees: prev.assignees.filter((a) => a !== payload.userId),
                    };
                }
                return prev;
            });
        },
        [cardId]
    );

    return card;
};
