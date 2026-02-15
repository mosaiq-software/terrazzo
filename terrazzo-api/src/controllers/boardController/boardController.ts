import { ModuleHeader, TrzModuleType } from '@mosaiq/terrazzo-common';
import { syncBoardFields, syncParentsDirectoryContents } from '@trz-api/broadcasters';
import { updateModule } from '../moduleController';

export async function updateBoardFromPartial(boardId: BoardId, partial: Partial<ModuleHeader<TrzModuleType.Board>>) {
    try {
        await updateModule(boardId, TrzModuleType.Board, partial);
        await syncBoardFields(boardId);
        await syncParentsDirectoryContents(boardId);
    } catch (e: any) {
        throw new Error('Failed to update board ' + e);
    }
}
