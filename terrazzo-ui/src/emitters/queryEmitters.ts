import { ClientSE } from '@mosaiq/terrazzo-common/socketTypes';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getSearchResults = async (sockCtx: SocketContextType, query: string, searchSessionId: string) => {
    return await sockCtx.emit(ClientSE.GET_SEARCH_RESULTS, { query, searchSessionId });
};
