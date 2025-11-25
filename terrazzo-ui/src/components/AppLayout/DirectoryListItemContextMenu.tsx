import { TrzModuleType, UID } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { createBoard, createDocument } from '@trz/emitters';
import { createDirectory } from '@trz/emitters/directoryEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { MdAdd } from 'react-icons/md';
import { ContextMenuLayout } from '../ContextMenu/ContextMenuLayout';
import { ContextMenuSelectorMenu } from '../ContextMenu/ContextMenuSelectorMenu';

interface DirectoryListItemContextMenuProps {
    parentId: UID;
    parentName: string;
    allowAddItem?: boolean;
    onClose: () => void;
}
export const DirectoryListItemContextMenu = (props: DirectoryListItemContextMenuProps) => {
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
                    notify(NoteType.CARD_UPDATE_ERROR, 'Unknown module type: ' + type);
                    return;
            }
        } catch (e) {
            notify(NoteType.CARD_UPDATE_ERROR, e);
            return;
        }
    }

    return (
        <ContextMenuLayout>
            {props.allowAddItem && (
                <ContextMenuSelectorMenu
                    title={`Create New in ${props.parentName}`}
                    icon={<MdAdd size={16} />}
                    items={[
                        { id: TrzModuleType.Directory, label: 'Directory' },
                        { id: TrzModuleType.Board, label: 'Board' },
                        { id: TrzModuleType.Document, label: 'Document' },
                    ]}
                    onSelect={(selected: TrzModuleType) => {
                        addItem(selected);
                        props.onClose();
                    }}
                />
            )}
        </ContextMenuLayout>
    );
};
