import { Stack } from '@mantine/core';
import { OrganizationId, TrzModuleType } from '@mosaiq/terrazzo-common';
import { useDirectoryContents } from '@trz/hooks/useDirectoryContents';
import { DirectoryTreeItem } from './DirectoryTreeItem';

interface DirectoryTreeProps {
    sidebarCollapsed: boolean;
    orgId: OrganizationId | undefined;
}
export const DirectoryTree = (props: DirectoryTreeProps) => {
    const contents = useDirectoryContents(props.orgId, TrzModuleType.Organization);

    if (!props.orgId || !contents) {
        console.error('No orgId or contents for DirectoryTree', props.orgId, contents);
        return null;
    }

    return (
        <Stack
            gap={0}
            p={0}
        >
            {contents.map((item) => (
                <DirectoryTreeItem
                    key={item.id}
                    sidebarCollapsed={props.sidebarCollapsed}
                    directoryListItem={item}
                    indent={0}
                    visible={true}
                />
            ))}
        </Stack>
    );
};
