import { Button, Container, Group, TextInput, Title } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { AuthProvider } from '@mosaiq/terrazzo-common';
import { useUserContext } from '@trz/contexts/user-context';
import React, { useState } from 'react';

const LinkDevAccount = (props: ContextModalProps<{}>): React.JSX.Element => {
    const [username, setUsername] = useState<string>('');
    const userCtx = useUserContext();

    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    const handleLink = () => {
        try {
            userCtx.handleLoginFromProvider({
                provider: AuthProvider.DEV,
                username: username.trim(),
            });
        } catch (error) {
            console.error('Failed to link DEV account:', error);
        }
        handleClose();
    };

    return (
        <Container onKeyDown={getHotkeyHandler([['Escape', handleClose]])}>
            <Title
                order={3}
                mb="md"
            >
                Link Development Account
            </Title>
            <TextInput
                label="Development Username"
                placeholder="Enter your development username"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                mb="md"
            />
            <Group>
                <Button
                    variant="default"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    disabled={username.trim() === ''}
                    onClick={handleLink}
                >
                    Link Account
                </Button>
            </Group>
        </Container>
    );
};

export const LinkDevAccountModal = (props: ContextModalProps<{}>) => <LinkDevAccount {...props} />;
