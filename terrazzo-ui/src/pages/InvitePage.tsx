import { Avatar, Button, Center, Loader, Space, Stack, Text, Title } from '@mantine/core';
import { InviteId } from '@mosaiq/terrazzo-common/types';
import { isInviteExpired } from '@mosaiq/terrazzo-common/utils/inviteUtils';
import { useSocket } from '@trz/contexts/socket-context';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { useUser } from '@trz/contexts/user-context';
import { acceptInvite } from '@trz/emitters';
import { useInvite } from '@trz/hooks/useInvite';
import { NoteType, notify } from '@trz/util/notifications';
import { setTitle } from '@trz/util/tabUtils';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const InvitePage = (): React.JSX.Element => {
    const params = useParams();
    const inviteId = params.inviteId as InviteId | undefined;
    const { invite, invitingOrg } = useInvite(inviteId);
    const usr = useUser();
    const trz = useTRZ();
    const sockCtx = useSocket();
    const navigate = useNavigate();
    const [accepting, setAccepting] = React.useState(false);

    useEffect(() => {
        setTitle(`Invite | Terrazzo`);
    }, []);

    const handleAcceptInvite = async () => {
        if (!invite) {
            return;
        }
        try {
            setAccepting(true);
            const success = await acceptInvite(sockCtx, invite.id);
            if (!success) {
                notify(NoteType.GENERIC_ERROR, 'Failed to accept invite');
                setAccepting(false);
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
            trz.selectOrganization(invite.forOrganizationId);
            navigate(`/org/${invite.forOrganizationId}`);
        } catch (err) {
            navigate('/');
        }
        setAccepting(false);
    };

    if (!usr.userData) {
        return <Loader />;
    }

    return (
        <Center
            h="100%"
            w="100%"
        >
            <Stack
                py="2rem"
                align="center"
                maw={400}
            >
                {!invite ? (
                    <Loader />
                ) : (
                    <>
                        <Text>{`Hi ${usr.userData.firstName}, you have been invited to join`}</Text>
                        <Avatar
                            src={invitingOrg?.logoUrl || undefined}
                            size={100}
                            radius="md"
                        />
                        <Title>{invitingOrg?.name || 'Unknown Organization'}</Title>
                        <Text>{invitingOrg?.description || null}</Text>
                        <Space h="1rem" />
                        {isInviteExpired(invite) ? (
                            <>
                                <Text c="red">This invite has expired and can no longer be used.</Text>
                                <Button
                                    variant="subtle"
                                    fullWidth
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Back
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    fullWidth
                                    onClick={handleAcceptInvite}
                                    loading={accepting}
                                >
                                    {`Accept Invite as @${usr.userData.username}`}
                                </Button>
                                <Button
                                    variant="subtle"
                                    fullWidth
                                    onClick={() => navigate('/dashboard')}
                                    disabled={accepting}
                                >
                                    Decline
                                </Button>
                            </>
                        )}
                    </>
                )}
            </Stack>
        </Center>
    );
};

export default InvitePage;
