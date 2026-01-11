import { Button, Center, Divider, Group, Loader, Modal, Stack, Text } from '@mantine/core';
import { TextBlockId, TextBlockResourceType, UID } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { useCatchSaveKey } from '@trz/hooks/useCatchSaveKey';
import { useTextBlockHistorySnapshots } from '@trz/hooks/useTextBlockHistorySnapshots';
import { useState } from 'react';
import { BaseBlockNoteEditor } from './BaseBlockNoteEditor';

interface BlockNoteEditorHistoryModalProps {
    textBlockId: TextBlockId;
    resourceId: UID;
    resourceType: TextBlockResourceType;
}
export const BlockNoteEditorHistoryModal = (props: BlockNoteEditorHistoryModalProps) => {
    const [modalOpened, setModalOpened] = useState(false);
    const sockCtx = useSocket();
    const snapshots = useTextBlockHistorySnapshots(modalOpened ? props.textBlockId : undefined, props.resourceId, props.resourceType);
    useCatchSaveKey();

    if (!modalOpened) {
        return <Button onClick={() => setModalOpened(true)}>Show History</Button>;
    }

    if (!props.textBlockId) {
        return (
            <Center>
                <Stack align="center">
                    <Loader type="bars" />
                    <Text ta="center">Loading...</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Modal.Root
            opened
            closeOnClickOutside
            onClose={() => setModalOpened(false)}
            centered
            size={'1000px'}
            zIndex={10000}
        >
            <Modal.Overlay
                backgroundOpacity={0.5}
                blur={3}
            />
            <Modal.Content
                h={'90vh'}
                bg={'#1d2022'}
                c={'white'}
                style={{
                    overflowX: 'hidden',
                    overflowY: 'scroll',
                }}
            >
                <Modal.Header
                    p="0"
                    bg={'#1d2022'}
                >
                    <Modal.Title w={'100%'}>
                        <Group justify="space-between">
                            <Text
                                size="xl"
                                fw={600}
                            >
                                History
                            </Text>
                        </Group>
                        <Modal.CloseButton
                            variant="transparent"
                            c={'white'}
                            style={{
                                position: 'absolute',
                                top: '0.75rem',
                                right: '0.75rem',
                                backdropFilter: 'blur(5px)',
                            }}
                        />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body p={20}>
                    <Group
                        style={{
                            position: 'relative',
                        }}
                        pb="8rem"
                    >
                        <BaseBlockNoteEditor
                            viewOnly={true}
                            textBlockId={props.textBlockId}
                            socketIOProvider={undefined}
                            doc={undefined}
                            placeholder={undefined}
                            myId={undefined}
                            myName={undefined}
                            pfpColor={undefined}
                            syncStatus={undefined}
                            connectionStatus={undefined}
                        />
                        <Stack>
                            {snapshots.map((snapshot) => {
                                return (
                                    <Stack
                                        key={snapshot.snapshotId}
                                        gap={0}
                                    >
                                        <Text>{new Date(snapshot.timestamp).toLocaleString()}</Text>
                                        <Divider my="xs" />
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </Group>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
