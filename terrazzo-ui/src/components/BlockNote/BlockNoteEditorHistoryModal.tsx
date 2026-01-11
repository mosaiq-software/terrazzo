import { Block } from '@blocknote/core';
import { Button, Center, Divider, Group, Loader, Modal, ScrollArea, Stack, Text } from '@mantine/core';
import { TextBlockId, TextBlockResourceType, TextBlockSnapshot, UID } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { useCatchSaveKey } from '@trz/hooks/useCatchSaveKey';
import { useTextBlockHistorySnapshots } from '@trz/hooks/useTextBlockHistorySnapshots';
import { useState } from 'react';
import { ReadonlyBlockNote } from './ReadonlyBlockNote';

interface BlockNoteEditorHistoryModalProps {
    textBlockId: TextBlockId;
    resourceId: UID;
    resourceType: TextBlockResourceType;
}
export const BlockNoteEditorHistoryModal = (props: BlockNoteEditorHistoryModalProps) => {
    const [modalOpened, setModalOpened] = useState(false);
    const sockCtx = useSocket();
    const snapshots = useTextBlockHistorySnapshots(
        modalOpened ? props.textBlockId : undefined,
        props.resourceId,
        props.resourceType
    );
    const [selectedSnapshot, setSelectedSnapshot] = useState<TextBlockSnapshot | undefined>(undefined);
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

    const content = selectedSnapshot ? (JSON.parse(selectedSnapshot.content) as Block[]) : [];
    console.log('Rendering history modal with snapshots:', snapshots, 'and selected snapshot:', selectedSnapshot);
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
                    overflow: 'hidden',
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
                <Modal.Body
                    p={20}
                    style={{ overflow: 'hidden', height: 'calc(90vh - 80px)', display: 'flex' }}
                >
                    <Group
                        justify="space-between"
                        align="flex-start"
                        wrap="nowrap"
                        style={{ flex: 1, height: '100%' }}
                    >
                        <ScrollArea style={{ flex: 1, height: '100%' }}>
                            {content?.length ? (
                                <ReadonlyBlockNote content={content} />
                            ) : (
                                <Center
                                    h={'100%'}
                                    w={'100%'}
                                >
                                    {selectedSnapshot ? (
                                        <Text c="dimmed">No content available for this snapshot.</Text>
                                    ) : (
                                        <Text c="dimmed">Select a snapshot to view its content.</Text>
                                    )}
                                </Center>
                            )}
                        </ScrollArea>
                        <ScrollArea
                            w={250}
                            h={'100%'}
                            style={{ flexShrink: 0 }}
                        >
                            <Stack gap={2}>
                                {snapshots.map((snapshot, index) => {
                                    return (
                                        <>
                                            <Stack
                                                key={snapshot.snapshotId}
                                                gap={0}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor:
                                                        selectedSnapshot?.snapshotId === snapshot.snapshotId
                                                            ? 'rgba(255, 255, 255, 0.1)'
                                                            : 'transparent',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                }}
                                                onClick={() => {
                                                    if (selectedSnapshot?.snapshotId === snapshot.snapshotId) {
                                                        setSelectedSnapshot(undefined);
                                                    } else {
                                                        setSelectedSnapshot(snapshot);
                                                    }
                                                }}
                                            >
                                                <Text>{new Date(snapshot.timestamp).toLocaleString()}</Text>
                                            </Stack>
                                            {index < snapshots.length - 1 && <Divider my="xs" />}
                                        </>
                                    );
                                })}
                            </Stack>
                        </ScrollArea>
                    </Group>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};
