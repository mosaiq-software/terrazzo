import { Button, Group, Stack, TextInput } from '@mantine/core';
import { ModuleHeader, ModulePermissions } from '@mosaiq/terrazzo-common';
import { COLOR_UNSET } from '@trz/util/colorUtils';
import { PermissionsEditor } from './PermissionsEditor/PermissionsEditor';

interface ModuleSettingsLayoutProps {
    moduleHeader: ModuleHeader;
    onChangeTitle: (newTitle: string) => void;
    onChangePermissions: (newPermissions: ModulePermissions) => void;
    saved: boolean;
    onSave: () => void;
    onClose: () => void;
    children?: React.ReactNode;
}

export const ModuleSettingsLayout = (props: ModuleSettingsLayoutProps) => {
    return (
        <Stack
            style={{
                position: 'relative',
            }}
        >
            <TextInput
                labelProps={{
                    c: 'white',
                }}
                label="Document Name"
                placeholder="My Document"
                required
                value={props.moduleHeader.name}
                onChange={(e) => {
                    props.onChangeTitle(e.target.value);
                }}
            />
            {props.children}
            <PermissionsEditor
                desiredPermissions={props.moduleHeader.desiredPermissions}
                onChange={props.onChangePermissions}
            />
            <Group
                bg={COLOR_UNSET}
                style={{
                    position: 'sticky',
                    bottom: '0',
                    marginInline: '1rem',
                    padding: '1rem',
                    zIndex: 10,
                    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
                    borderRadius: '4px',
                }}
            >
                <Button
                    variant="subtle"
                    onClick={props.onClose}
                >
                    Close
                </Button>
                <Button
                    disabled={props.saved}
                    onClick={props.onSave}
                >
                    Save Changes
                </Button>
            </Group>
        </Stack>
    );
};
