import { CardHeader, CardId } from '@mosaiq/terrazzo-common';
import { CacheManager } from '@trz-api/utils/cacheManager';

export const cacheCard = async (card: CardHeader) => {
    await CacheManager.getInstance().set(cardCacheKey(card.id), card, 300);
};

export const invalidateCardCache = async (cardId: CardId) => {
    await CacheManager.getInstance().del(cardCacheKey(cardId));
};

export const getCachedCard = async (cardId: CardId) => {
    return CacheManager.getInstance().get<CardHeader>(cardCacheKey(cardId));
};

const cardCacheKey = (cardId: CardId) => `card:${cardId}`;
