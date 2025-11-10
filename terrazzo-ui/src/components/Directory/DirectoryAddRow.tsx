import { Menu, Group, Box } from '@mantine/core';
import { TrzModuleType } from '@mosaiq/terrazzo-common/types';

interface AddItemMenuProps {
    onAddItem: (type: TrzModuleType) => void;
}
export const AddItemMenu = (props: AddItemMenuProps): React.JSX.Element => {
    return (
        <Menu>
            <Menu.Target>
                <Group style={{ cursor: 'pointer', width: '100%' }}>
                    <Box c="white">Add Item</Box>
                </Group>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Item onClick={() => props.onAddItem(TrzModuleType.Directory)}>Add Directory</Menu.Item>
                <Menu.Item onClick={() => props.onAddItem(TrzModuleType.Document)}>Add Document</Menu.Item>
                <Menu.Item onClick={() => props.onAddItem(TrzModuleType.Board)}>Add Board</Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
