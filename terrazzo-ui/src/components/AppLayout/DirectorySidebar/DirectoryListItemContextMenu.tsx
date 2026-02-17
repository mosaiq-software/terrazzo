import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { ModuleHeader, PermissibleAction, TrzModule, UID } from '@mosaiq/terrazzo-common';
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
    addItem: (toParentId: UID, type: TrzModule) => Promise<void>;
}
export const DirectoryListItemContextMenu = (props: DirectoryListItemContextMenuProps) => {
    const userCanManageModules = useModulePermission(props.moduleHeader, PermissibleAction.ManageModules);

    const userCanManageModulesOrg = useOrgPermission(
        props.isRoot ? props.parentId : undefined,
        PermissibleAction.ManageModules
    );

    const creationMenuItems: { id: TrzModule; label: string }[] = useMemo(() => {
        const items: { id: TrzModule; label: string }[] = [];
        if (userCanManageModules || (props.isRoot && userCanManageModulesOrg)) {
            items.push({ id: TrzModule.Directory, label: 'Directory' });
            items.push({ id: TrzModule.Board, label: 'Board' });
            items.push({ id: TrzModule.Document, label: 'Document' });
        }
        return items;
    }, [userCanManageModules, userCanManageModulesOrg]);

    const showCreateOptions = creationMenuItems.length > 0;
    const showEditOptions = !!props.moduleHeader;

    return (
        <ContextMenuLayout title={props.parentName}>
            {props.allowAddItem && showCreateOptions && (
                <ContextMenuSelectorMenu
                    title="Add New..."
                    icon={<MdAdd size={16} />}
                    items={creationMenuItems}
                    onSelect={(selected: TrzModule) => {
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

const getSettingsTitle = (moduleType: TrzModule) => {
    switch (moduleType) {
        case TrzModule.Board:
            return 'Board Settings';
        case TrzModule.Document:
            return 'Document Settings';
        case TrzModule.Directory:
            return 'Directory Settings';
        default:
            return 'Module Settings';
    }
};
