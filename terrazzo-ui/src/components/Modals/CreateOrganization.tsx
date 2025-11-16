import { Button, Container, Flex, TextInput } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { useSocket } from '@trz/contexts/socket-context';
import { useUser } from '@trz/contexts/user-context';
import { createOrganization } from '@trz/emitters';
import { NoteType, notify } from '@trz/util/notifications';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateOrganization = (props: ContextModalProps<{ modalBody: string }>): React.JSX.Element => {
    const [orgName, setOrgName] = React.useState('');
    const [errorName, setErrorName] = useState('');
    const sockCtx = useSocket();
    const usr = useUser();
    const navigate = useNavigate();

    async function onSubmit() {
        setErrorName('');

        if (orgName.length < 1) {
            setErrorName('Enter a name');
            return;
        }
        if (orgName.length > 50) {
            setErrorName('Max 50 characters');
            return;
        }
        try {
            const ordId = await createOrganization(sockCtx, orgName);
            navigate(`/org/${ordId}`);
        } catch (e) {
            notify(NoteType.ORG_CREATION_ERROR, e);
        }
        props.context.closeModal(props.id);
    }

    return (
        <Container onKeyDown={getHotkeyHandler([['Enter', onSubmit]])}>
            <Flex
                direction="column"
                justify="center"
                align="center"
                gap="md"
            >
                <TextInput
                    label="Organization Name"
                    placeholder="My Organization"
                    withAsterisk
                    w={250}
                    value={orgName}
                    onChange={(event) => setOrgName(event.currentTarget.value)}
                    data-autofocus
                    error={errorName}
                />
            </Flex>

            <Button
                fullWidth
                mt="md"
                onClick={onSubmit}
            >
                Create Organization
            </Button>
        </Container>
    );
};

export const CreateOrganizationModal = (props: ContextModalProps<{ modalBody: string }>) => <CreateOrganization {...props} />;
