import { Alert, Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { ModuleHeader } from '@mosaiq/terrazzo-common';
import { COLOR_UNSET } from '@trz/util/colorUtils';
import { toTitleCase } from '@trz/util/textUtils';
import { useEffect, useState } from 'react';
import { RectHoldingButton } from '../UI/RectHoldingButton';
import { PermissionsEditor } from './PermissionsEditor/PermissionsEditor';

interface ModuleSettingsLayoutProps {
    moduleHeader: ModuleHeader;
    onSave: (edits: Partial<Omit<ModuleHeader, 'type'>>) => void;
    onClose: () => void;
    children?: React.ReactNode;
    disabled?: boolean;
}

export const ModuleSettingsLayout = (props: ModuleSettingsLayoutProps) => {
    const [editedTitle, setEditedTitle] = useState<string>(props.moduleHeader.name);
    useEffect(() => {
        setEditedTitle(props.moduleHeader.name);
    }, [props.moduleHeader.name]);

    if (props.moduleHeader.archived) {
        return (
            <Alert
                title={`Archived ${toTitleCase(props.moduleHeader.type)}`}
                color="yellow"
            >
                <Stack>
                    <Text>This {props.moduleHeader.type} is archived and can only be viewed.</Text>
                    <Button
                        variant="subtle"
                        onClick={() => {
                            props.onSave({ archived: false });
                        }}
                    >
                        {`Unarchive ${toTitleCase(props.moduleHeader.type)}`}
                    </Button>
                </Stack>
            </Alert>
        );
    }

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
                label={toTitleCase(`${props.moduleHeader.type} Name`)}
                placeholder={toTitleCase(`My ${props.moduleHeader.type}`)}
                required
                value={editedTitle}
                onChange={(e) => {
                    setEditedTitle(e.currentTarget.value);
                }}
                onBlur={() => props.onSave({ name: editedTitle })}
                disabled={props.disabled}
            />
            {props.children}
            <PermissionsEditor
                desiredPermissions={props.moduleHeader.desiredPermissions}
                onChange={(newPerms) => {
                    props.onSave({ desiredPermissions: newPerms });
                }}
                disabled={props.disabled}
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
                justify="space-between"
            >
                <Group>
                    <Button
                        variant="outline"
                        onClick={props.onClose}
                    >
                        Close
                    </Button>
                </Group>
                <Group>
                    <RectHoldingButton
                        durationMs={3000}
                        onClick={() => {
                            props.onSave({ archived: true });
                        }}
                        borderColor="red"
                        variant="outline"
                        disabled={props.disabled}
                    >
                        Hold to Archive
                    </RectHoldingButton>
                </Group>
            </Group>
        </Stack>
    );
};
