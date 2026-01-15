import { Button, Container, Group, Select, Stack, Text, Title } from '@mantine/core';
import { getHotkeyHandler } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import { fullName, UserId } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { useUserContext } from '@trz/contexts/user-context';
import { updateOrgField } from '@trz/emitters';
import { COLORS } from '@trz/util/colors';
import { NoteType, notify } from '@trz/util/notifications';
import React, { useState } from 'react';
import { RectHoldingButton } from '../UI/RectHoldingButton';
import { UserAvatar } from '../UI/UserAvatar/UserAvatar';

const TransferOrganization = (props: ContextModalProps<{}>): React.JSX.Element => {
    const [toUserId, setToUserId] = useState<UserId | undefined>(undefined);
    const orgCtx = useOrg();
    const userCtx = useUserContext();
    const sockCtx = useSocket();

    const newOwner = orgCtx.members.find((m) => m.userId === toUserId);
    const possibleUsers = orgCtx.members.filter((m) => m.userId !== userCtx.userId);

    async function onSubmit() {
        try {
            if (!toUserId) {
                throw new Error('Please select a user to transfer the organization to.');
            }
            if (userCtx.userId !== orgCtx.active?.ownerId) {
                throw new Error('Only the organization owner can transfer the organization.');
            }
            if (!orgCtx.active) {
                throw new Error('No active organization found.');
            }
            if (!newOwner) {
                throw new Error('Selected user is not a member of the organization.');
            }
            await updateOrgField(sockCtx, orgCtx.active.id, { ownerId: toUserId });
            notify(NoteType.CHANGES_SAVED, `Organization transferred to ${fullName(newOwner.user)} successfully.`);
            props.context.closeModal(props.id);
            return;
        } catch (err) {
            notify(NoteType.GENERIC_ERROR, err);
            return;
        }
    }

    const handleClose = () => {
        props.context.closeModal(props.id);
    };

    const existsSomeoneToTransferTo = possibleUsers.length > 0;

    return (
        <Container onKeyDown={getHotkeyHandler([['Escape', handleClose]])}>
            {existsSomeoneToTransferTo ? (
                <>
                    <Select
                        label="Transfer To"
                        placeholder="Select User"
                        w={350}
                        value={toUserId}
                        defaultValue={possibleUsers.length === 1 ? possibleUsers[0].userId : undefined}
                        onChange={(value) => setToUserId(value as UserId)}
                        data={possibleUsers.map((member) => ({
                            value: member.userId,
                            label: `${fullName(member.user)} @${member.user.username}`,
                        }))}
                        renderOption={(item) => {
                            const [name, username] = item.option.label.split(' @');
                            const user = possibleUsers.find((m) => m.userId === item.option.value);
                            if (!user) return null;
                            return (
                                <Group>
                                    <UserAvatar
                                        user={user.user}
                                        size={40}
                                        showProfilePopover={false}
                                        showTooltip={false}
                                    />
                                    <Stack gap={0}>
                                        <Title order={5}>{name}</Title>
                                        <Text
                                            size="sm"
                                            c={COLORS.text.muted}
                                        >
                                            @{username}
                                        </Text>
                                    </Stack>
                                </Group>
                            );
                        }}
                    />
                    <Text
                        c={COLORS.text.muted}
                        size="sm"
                        mt="sm"
                        mb="md"
                    >
                        This will transfer full ownership of the organization to the selected user. You will lose access
                        to administrative functions unless the new owner grants them back to you.
                    </Text>
                </>
            ) : (
                <>
                    <Title
                        order={4}
                        size="md"
                        mb="md"
                        w="100%"
                    >
                        Looks like it's just you!
                    </Title>
                    <Text
                        c={COLORS.text.muted}
                        size="sm"
                        mb="md"
                    >
                        There are no other members in this organization to transfer ownership to.
                    </Text>
                </>
            )}
            <Group>
                <Button
                    variant="default"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <RectHoldingButton
                    onClick={onSubmit}
                    durationMs={2000}
                    tooltip={
                        toUserId
                            ? 'This action cannot be undone. Hold to confirm.'
                            : 'Select a user to transfer the organization to.'
                    }
                    width={250}
                    borderColor={COLORS.semantic.error}
                    disabled={!toUserId}
                >
                    Hold to Transfer Organization
                </RectHoldingButton>
            </Group>
        </Container>
    );
};

export const TransferOrganizationModal = (props: ContextModalProps<{}>) => <TransferOrganization {...props} />;
