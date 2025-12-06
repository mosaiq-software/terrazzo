import { Fieldset, Stack } from '@mantine/core';
import { UID } from '@mosaiq/terrazzo-common/types';
import { useOrg } from '@trz/contexts/org-context';

interface PermissionsEditorProps {
    moduleId: UID;
}

export const PermissionsEditor = (props: PermissionsEditorProps) => {
    const orgCtx = useOrg();

    return (
        <Fieldset legend="Permissions">
            <Stack>{}</Stack>
        </Fieldset>
    );
};
