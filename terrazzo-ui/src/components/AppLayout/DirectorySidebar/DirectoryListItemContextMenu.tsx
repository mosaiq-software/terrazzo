import { modals } from '@mantine/modals';
import { MinimalModuleHeader, TrzModuleType, UID } from '@mosaiq/terrazzo-common/types';
import { ContextMenuButton } from '@trz/components/ContextMenu/ContextMenuButton';
import { ContextMenuLayout } from '@trz/components/ContextMenu/ContextMenuLayout';
import { ContextMenuSelectorMenu } from '@trz/components/ContextMenu/ContextMenuSelectorMenu';
import { useSocket } from '@trz/contexts/socket-context';
import { createDocument } from '@trz/emitters';
import { createDirectory } from '@trz/emitters/directoryEmitters';
import { NoteType, notify } from '@trz/util/notifications';
import { MdAdd, MdSettings } from 'react-icons/md';

interface DirectoryListItemContextMenuProps {
    miniModuleHeader?: MinimalModuleHeader;
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
                    modals.openContextModal({
                        modal: 'board',
                        title: 'Create New Board',
                        innerProps: { parentId: props.parentId },
                    });
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
        <ContextMenuLayout title={props.parentName}>
            {props.allowAddItem && (
                <ContextMenuSelectorMenu
                    title={`Create New`}
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
            {!!props.miniModuleHeader && (
                <ContextMenuButton
                    icon={<MdSettings size={16} />}
                    text={getSettingsTitle(props.miniModuleHeader.type)}
                    onClick={() => {
                        modals.openContextModal({
                            modal: 'moduleSettings',
                            title: 'Settings',
                            innerProps: { moduleHeader: props.miniModuleHeader },
                            size: 'xl',
                        });
                        props.onClose();
                    }}
                />
            )}
        </ContextMenuLayout>
    );
};

const getSettingsTitle = (moduleType: TrzModuleType) => {
    switch (moduleType) {
        case TrzModuleType.Board:
            return 'Board Settings';
        case TrzModuleType.Document:
            return 'Document Settings';
        case TrzModuleType.Directory:
            return 'Directory Settings';
        default:
            return 'Module Settings';
    }
};
