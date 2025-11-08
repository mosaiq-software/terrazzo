// import { ClientSE, Position } from '@mosaiq/terrazzo-common/socketTypes';
// import { TextBlock, TextBlockId } from '@mosaiq/terrazzo-common/types';
// import { SocketContextType } from '@trz/contexts/socket-context';
// import { NoteType, notify } from '@trz/util/notifications';

// export const initializeTextBlockData = async (sockCtx: SocketContextType, textBlockId: TextBlockId): Promise<TextBlock | undefined> => {
//     try {
//         const text = await sockCtx.emit<ClientSE.GET_TEXT_BLOCK>(ClientSE.GET_TEXT_BLOCK, textBlockId);
//         return text;
//     } catch (e: any) {
//         notify(NoteType.TEXT_BLOCK_INIT_ERROR, e);
//         return undefined;
//     }
// };

// export const emitTextBlockEvents = async (sockCtx: SocketContextType, textBlockEvents: TextBlockEvent[]): Promise<string | undefined> => {
//     try {
//         const res = await sockCtx.emit<ClientSE.UPDATE_TEXT_BLOCK>(ClientSE.UPDATE_TEXT_BLOCK, textBlockEvents);
//         return res;
//     } catch (e) {
//         notify(NoteType.TEXT_EVENT_WARN, e);
//     }
// };

// export const syncUpdatedCaret = (sockCtx: SocketContextType, pos?: Position) => {
//     sockCtx.volatileEmit<ClientSE.TEXT_CARET>(ClientSE.TEXT_CARET, pos);
// };
