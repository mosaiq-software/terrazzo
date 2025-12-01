import { Button, Container, Flex, TextInput } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { extractUUID } from '@trz/util/idUtils';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinOrganization = (props: ContextModalProps<{}>): React.JSX.Element => {
    const [inviteCode, setInviteCode] = React.useState('');
    const [errorInviteCode, setErrorInviteCode] = useState('');
    const navigate = useNavigate();

    async function onSubmit() {
        setErrorInviteCode('');
        try {
            const cleanedCode = extractUUID(inviteCode);
            if (!cleanedCode) {
                setErrorInviteCode('Invalid invite code or link.');
                return;
            }
            navigate(`/invite/${cleanedCode}`);
            props.context.closeModal(props.id);
            return;
        } catch (err) {
            setErrorInviteCode('Invalid invite code or link.');
            return;
        }
    }

    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    return (
        <Container
            onKeyDown={getHotkeyHandler([
                ['Enter', onSubmit],
                ['Escape', handleClose],
            ])}
        >
            <Flex
                direction="column"
                justify="center"
                align="center"
                gap="md"
            >
                <TextInput
                    label="Invite code or Link"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    withAsterisk
                    w={350}
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.currentTarget.value)}
                    onFocus={() => setErrorInviteCode('')}
                    data-autofocus
                    error={errorInviteCode}
                />
            </Flex>

            <Button
                fullWidth
                mt="md"
                onClick={onSubmit}
            >
                Join Organization
            </Button>
        </Container>
    );
};

export const JoinOrganizationModal = (props: ContextModalProps<{}>) => <JoinOrganization {...props} />;
