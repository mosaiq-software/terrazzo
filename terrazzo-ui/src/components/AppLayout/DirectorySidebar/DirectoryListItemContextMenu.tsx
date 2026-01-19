import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { ModuleHeader, PermissibleAction, TrzModuleType, UID } from '@mosaiq/terrazzo-common';
import { ContextMenuButton } from '@trz/components/ContextMenu/ContextMenuButton';
import { ContextMenuLayout } from '@trz/components/ContextMenu/ContextMenuLayout';
import { ContextMenuSelectorMenu } from '@trz/components/ContextMenu/ContextMenuSelectorMenu';
import { useModulePermission, useOrgPermission } from '@trz/hooks/usePermissions';
import { COLORS } from '@trz/util/colors';
import { useMemo } from 'react';
import { MdAdd, MdSettings } from 'react-icons/md';

interface DirectoryListItemContextMenuProps {
    moduleHeader?: ModuleHeader;
    parentId: UID;
    parentName: string;
    allowAddItem?: boolean;
    isRoot?: boolean;
    onClose: () => void;
    addItem: (toParentId: UID, type: TrzModuleType) => Promise<void>;
}
export const DirectoryListItemContextMenu = (props: DirectoryListItemContextMenuProps) => {
    const userCanCreateBoards = useModulePermission(props.moduleHeader, PermissibleAction.CreateBoard);
    const userCanCreateDocuments = useModulePermission(props.moduleHeader, PermissibleAction.CreateDocument);
    const userCanCreateDirectories = useModulePermission(props.moduleHeader, PermissibleAction.CreateDirectory);

    const userCanCreateBoardsOrg = useOrgPermission(
        props.isRoot ? props.parentId : undefined,
        PermissibleAction.CreateBoard
    );
    const userCanCreateDocumentsOrg = useOrgPermission(
        props.isRoot ? props.parentId : undefined,
        PermissibleAction.CreateDocument
    );
    const userCanCreateDirectoriesOrg = useOrgPermission(
        props.isRoot ? props.parentId : undefined,
        PermissibleAction.CreateDirectory
    );

    const creationMenuItems: { id: TrzModuleType; label: string }[] = useMemo(() => {
        const items: { id: TrzModuleType; label: string }[] = [];
        if (userCanCreateDirectories || (props.isRoot && userCanCreateDirectoriesOrg)) {
            items.push({ id: TrzModuleType.Directory, label: 'Directory' });
        }
        if (userCanCreateBoards || (props.isRoot && userCanCreateBoardsOrg)) {
            items.push({ id: TrzModuleType.Board, label: 'Board' });
        }
        if (userCanCreateDocuments || (props.isRoot && userCanCreateDocumentsOrg)) {
            items.push({ id: TrzModuleType.Document, label: 'Document' });
        }
        return items;
    }, [
        userCanCreateBoards,
        userCanCreateDocuments,
        userCanCreateDirectories,
        userCanCreateBoardsOrg,
        userCanCreateDocumentsOrg,
        userCanCreateDirectoriesOrg,
    ]);

    const showCreateOptions = creationMenuItems.length > 0;
    const showEditOptions = !!props.moduleHeader;

    return (
        <ContextMenuLayout title={props.parentName}>
            {props.allowAddItem && showCreateOptions && (
                <ContextMenuSelectorMenu
                    title="Add New..."
                    icon={<MdAdd size={16} />}
                    items={creationMenuItems}
                    onSelect={(selected: TrzModuleType) => {
                        props.addItem(props.parentId, selected);
                        props.onClose();
                    }}
                />
            )}
            {!!props.moduleHeader && (
                <ContextMenuButton
                    icon={<MdSettings size={16} />}
                    text={getSettingsTitle(props.moduleHeader.type)}
                    onClick={() => {
                        modals.openContextModal({
                            modal: 'moduleSettings',
                            title: 'Settings',
                            innerProps: { moduleHeader: props.moduleHeader },
                            size: 'xl',
                        });
                        props.onClose();
                    }}
                />
            )}
            {!showCreateOptions && !showEditOptions && (
                <Text style={{ padding: '8px', color: COLORS.text.muted }}>No actions available</Text>
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
