import { Block } from '@blocknote/core';
import {
    ActionIcon,
    Badge,
    Box,
    Center,
    Divider,
    Group,
    Loader,
    Modal,
    ScrollArea,
    Space,
    Stack,
    Text,
    Tooltip,
} from '@mantine/core';
import { TextBlockId, TextBlockResourceType, TextBlockSnapshot, UID } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { restoreTextBlockSnapshot } from '@trz/emitters';
import { useTextBlockHistorySnapshots } from '@trz/hooks/data/useTextBlockHistorySnapshots';
import { useCatchSaveKey } from '@trz/hooks/util/useCatchSaveKey';
import { COLORS } from '@trz/util/colors';
import { getRandomColorFromString } from '@trz/util/colorUtils';
import { niceDateWithTime } from '@trz/util/dateUtils';
import { completelyCaptureEvent } from '@trz/util/eventUtils';
import React, { useState } from 'react';
import { MdHistory } from 'react-icons/md';
import { RectHoldingButton } from '../UI/RectHoldingButton';
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
        return (
            <Tooltip label="Editing History">
                <ActionIcon
                    variant="subtle"
                    onClick={() => setModalOpened(true)}
                >
                    <MdHistory
                        size={20}
                        color={COLORS.text.primary}
                    />
                </ActionIcon>
            </Tooltip>
        );
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

    return (
        <Modal.Root
            opened
            closeOnClickOutside
            onClose={() => setModalOpened(false)}
            centered
            zIndex={10000}
            size="80%"
        >
            <Modal.Overlay
                backgroundOpacity={0.5}
                blur={3}
            />
            <Modal.Content
                bg={COLORS.background.light}
                c={COLORS.text.primary}
            >
                <Modal.Header bg={COLORS.background.medium}>
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
                            c={COLORS.text.primary}
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
                    style={{ overflow: 'hidden', height: '80vh' }}
                    p={0}
                >
                    <Group
                        justify="space-between"
                        align="flex-start"
                        wrap="nowrap"
                        style={{ flex: 1, height: '100%' }}
                    >
                        <ScrollArea style={{ flex: 1, height: '100%' }}>
                            <Center
                                h={'100%'}
                                w={'100%'}
                                p="md"
                            >
                                {content?.length ? (
                                    <ReadonlyBlockNote content={content} />
                                ) : selectedSnapshot ? (
                                    <Text c={COLORS.text.muted}>No content available for this snapshot.</Text>
                                ) : (
                                    <Text c={COLORS.text.muted}>Select a snapshot to view its content.</Text>
                                )}
                            </Center>
                        </ScrollArea>
                        <ScrollArea
                            w={250}
                            h={'100%'}
                            style={{ flexShrink: 0 }}
                        >
                            <Stack
                                gap="xs"
                                bg={COLORS.background.dark}
                                pr="sm"
                                mih="80vh"
                            >
                                {snapshots.map((snapshot, index) => {
                                    return (
                                        <React.Fragment key={snapshot.snapshotId}>
                                            {index > 0 && <Divider m={0} />}
                                            <SnapshotItem
                                                snapshot={snapshot}
                                                isSelected={selectedSnapshot?.snapshotId === snapshot.snapshotId}
                                                onSelect={(snap) => setSelectedSnapshot(snap)}
                                                onRestore={async () => {
                                                    await restoreTextBlockSnapshot(
                                                        sockCtx,
                                                        snapshot.snapshotId,
                                                        props.resourceId,
                                                        props.resourceType
                                                    );
                                                    setModalOpened(false);
                                                }}
                                            />
                                        </React.Fragment>
                                    );
                                })}
                                <Stack
                                    mb="md"
                                    p="xs"
                                >
                                    <Text
                                        c={COLORS.text.muted}
                                        size="xs"
                                        ta="center"
                                    >
                                        Snapshots are created automatically every few minutes while editing, or when
                                        significant changes are made.
                                        <Space h="xs" />
                                        Old snapshots are pruned over time.
                                    </Text>
                                </Stack>
                            </Stack>
                        </ScrollArea>
                    </Group>
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

interface SnapshotItemProps {
    snapshot: TextBlockSnapshot;
    isSelected: boolean;
    onSelect: (snapshot: TextBlockSnapshot | undefined) => void;
    onRestore: () => void;
}
const SnapshotItem = (props: SnapshotItemProps) => {
    return (
        <Stack
            gap="sm"
            p="sm"
            style={{
                cursor: 'pointer',
                backgroundColor: props.isSelected ? COLORS.overlay.light : 'transparent',
                borderRadius: '4px',
            }}
            onClick={() => {
                if (props.isSelected) {
                    props.onSelect(undefined);
                } else {
                    props.onSelect(props.snapshot);
                }
            }}
        >
            <Text>{niceDateWithTime(props.snapshot.timestamp)}</Text>
            {props.snapshot.tags && (
                <Group>
                    {props.snapshot.tags.map((tag) => (
                        <Badge
                            key={tag}
                            size="xs"
                            variant="filled"
                            bg={getRandomColorFromString(tag)}
                            autoContrast
                        >
                            <Text size="xs">{tag}</Text>
                        </Badge>
                    ))}
                </Group>
            )}
            {props.isSelected && (
                <Box onClick={(e) => completelyCaptureEvent(e)}>
                    <RectHoldingButton
                        variant="outline"
                        durationMs={2000}
                        borderColor={COLORS.semantic.info}
                        onClick={props.onRestore}
                    >
                        Hold to Restore
                    </RectHoldingButton>
                </Box>
            )}
        </Stack>
    );
};
