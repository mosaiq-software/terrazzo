import { Alert, Button, CopyButton, Group, Stack, Switch, Text, TextInput } from '@mantine/core';
import { ModuleHeader } from '@mosaiq/terrazzo-common';
import { toTitleCase } from '@trz/util/textUtils';
import { useEffect, useState } from 'react';
import { MdLink } from 'react-icons/md';
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
                w="100%"
                pt="xl"
                justify="space-between"
            >
                <Switch
                    checked={props.moduleHeader.public}
                    onChange={(event) => {
                        props.onSave({ public: event.currentTarget.checked });
                    }}
                    disabled={props.disabled}
                    label="Public"
                    description="Public modules are viewable by anyone with the link"
                    styles={{
                        description: {
                            maxWidth: '10rem',
                        },
                    }}
                />
                {props.moduleHeader.public && (
                    <CopyButton value={'hi'}>
                        {({ copied, copy }) => (
                            <Button
                                variant="outline"
                                onClick={copy}
                                disabled={props.disabled}
                                leftSection={<MdLink size={16} />}
                            >
                                {copied ? 'Link Copied' : 'Copy Public Link'}
                            </Button>
                        )}
                    </CopyButton>
                )}
                <RectHoldingButton
                    durationMs={3000}
                    onClick={() => {
                        props.onSave({ archived: true });
                    }}
                    borderColor="red"
                    variant="outline"
                    disabled={props.disabled}
                    tooltip={`Archived ${props.moduleHeader.type}s can be restored at any time`}
                >
                    Hold to Archive
                </RectHoldingButton>
            </Group>
        </Stack>
    );
};
