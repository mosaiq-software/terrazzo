import { TrzModule, UID, TrzModuleType } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { createDocument, createBoard } from '@trz/emitters';
import { createDirectory } from '@trz/emitters/directoryEmitters';
import { notify, NoteType } from '@trz/util/notifications';
import { AddItemMenu } from './DirectoryAddRow';
import { BoardRow } from './DirectoryBoardRow';
import { DirectoryRow } from './DirectoryDirectoryRow';
import { DocumentRow } from './DirectoryDocumentRow';

export interface DirectoryContentsRowsProps {
    modules: TrzModule[];
    parentId: UID;
    allowAddItem?: boolean;
}
export const DirectoryContentsRows = (props: DirectoryContentsRowsProps): React.JSX.Element => {
    const sockCtx = useSocket();

    async function addItem(type: TrzModuleType) {
        if (!props.parentId || !props.allowAddItem || !type) {
            return;
        }
        try {
            switch (type) {
                case TrzModuleType.Directory:
                    await createDirectory(sockCtx, 'New Directory', props.parentId);
                    return;
                case TrzModuleType.Document:
                    await createDocument(sockCtx, 'New Document', props.parentId);
                    return;
                case TrzModuleType.Board:
                    await createBoard(sockCtx, 'New Board', '', props.parentId);
                    return;
                default:
                    console.error('Unknown module type:', type);
                    return;
            }
        } catch (e) {
            notify(NoteType.CARD_UPDATE_ERROR, e);
            return;
        }
    }

    const rows: React.JSX.Element[] = [];
    for (const module of props.modules) {
        switch (module.type) {
            case TrzModuleType.Directory:
                rows.push(
                    <DirectoryRow
                        key={module.directory.id}
                        directory={module.directory}
                    />
                );
                break;
            case TrzModuleType.Document:
                rows.push(
                    <DocumentRow
                        key={module.document.id}
                        document={module.document}
                    />
                );
                break;
            case TrzModuleType.Board:
                rows.push(
                    <BoardRow
                        key={module.board.id}
                        board={module.board}
                    />
                );
                break;
        }
    }
    if (props.allowAddItem) {
        rows.push(
            <AddItemMenu
                key="add-item-menu"
                onAddItem={addItem}
            />
        );
    }
    return <>{rows}</>;
};
