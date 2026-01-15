import { ClientSE, OrganizationId } from '@mosaiq/terrazzo-common';
import { SocketContextType } from '@trz/contexts/socket-context';

export const getSearchResults = async (
    sockCtx: SocketContextType,
    query: string,
    searchSessionId: string,
    orgId: OrganizationId
) => {
    return await sockCtx.emit(ClientSE.GET_SEARCH_RESULTS, { query, searchSessionId, orgId });
};
