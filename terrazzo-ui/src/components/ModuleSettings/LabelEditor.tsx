import { ActionIcon, ColorInput, Group, Stack, Text, TextInput, Tooltip } from '@mantine/core';
import { TEMPORARY_ID } from '@mosaiq/terrazzo-common/constants';
import { BoardId, Label } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { createBoardLabel, deleteBoardLabel, updateBoardLabel } from '@trz/emitters';
import { colorIsDarkAdvanced, generateRandomColor } from '@trz/util/colorUtils';
import { useState } from 'react';
import { MdOutlineAdd, MdOutlineCheck, MdOutlineClose, MdOutlineDelete, MdOutlineEdit } from 'react-icons/md';
import { RingHoldingButton } from '../UI/RingHoldingButton';

interface LabelEditorProps {
    labels: Label[];
    boardId: BoardId;
}

export const LabelEditor = (props: LabelEditorProps) => {
    const sockCtx = useSocket();
    const [editingLabel, setEditingLabel] = useState<Label | undefined>(undefined);

    const isValidLabel = (l?: Label) => {
        return l && l.name.trim().length > 0 && l.color.length === 7;
    };

    const onSaveLabel = () => {
        setEditingLabel(undefined);
        if (!editingLabel || !isValidLabel(editingLabel)) {
            return;
        }
        if (editingLabel.id === TEMPORARY_ID) {
            createBoardLabel(sockCtx, props.boardId, editingLabel.name, editingLabel.color);
            onCreateNewLabel();
        } else {
            updateBoardLabel(sockCtx, props.boardId, editingLabel);
        }
    };

    const onCreateNewLabel = () => {
        const newLabel: Label = {
            id: TEMPORARY_ID,
            name: '',
            boardId: props.boardId,
            color: generateRandomColor(),
        };
        setEditingLabel(newLabel);
    };
    return (
        <Stack>
            <Group
                justify="flex-start"
                wrap="wrap"
            >
                {props.labels.map((label) => {
                    const textColor = colorIsDarkAdvanced(label.color) ? '#ffffff' : '#000000';
                    return (
                        <Group
                            key={label.id}
                            bg={label.color}
                            w="fit-content"
                            wrap="nowrap"
                            justify="flex-start"
                            px="sm"
                            gap="0"
                            style={{
                                borderRadius: '10px',
                            }}
                        >
                            <Text
                                c={textColor}
                                size="sm"
                            >
                                {label.name}
                            </Text>
                            <ActionIcon
                                size="input-xs"
                                radius={'100%'}
                                bg={'transparent'}
                                onClick={() => {
                                    setEditingLabel(label);
                                }}
                            >
                                <MdOutlineEdit color={textColor} />
                            </ActionIcon>
                        </Group>
                    );
                })}
            </Group>
            {editingLabel && (
                <Group>
                    <TextInput
                        value={editingLabel.name}
                        onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                        placeholder="New Label..."
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === 'Return') {
                                onSaveLabel();
                            }
                        }}
                    />
                    <ColorInput
                        value={editingLabel.color}
                        onChange={(e) => setEditingLabel({ ...editingLabel, color: e })}
                    />
                    <Tooltip
                        label="Save"
                        openDelay={200}
                    >
                        <ActionIcon
                            size="input-sm"
                            onClick={onSaveLabel}
                            disabled={!isValidLabel(editingLabel)}
                        >
                            {editingLabel.id === TEMPORARY_ID && <MdOutlineAdd />}
                            {editingLabel.id !== TEMPORARY_ID && <MdOutlineCheck />}
                        </ActionIcon>
                    </Tooltip>
                    {editingLabel.id !== TEMPORARY_ID && (
                        <RingHoldingButton
                            tooltip="Hold to delete label"
                            durationMs={1000}
                            ringSize={50}
                            ringThickness={6}
                            color="red"
                            onClick={async () => {
                                setEditingLabel(undefined);
                                deleteBoardLabel(sockCtx, props.boardId, editingLabel.id);
                            }}
                        >
                            <MdOutlineDelete />
                        </RingHoldingButton>
                    )}
                    {editingLabel.id === TEMPORARY_ID && (
                        <Tooltip
                            label="Cancel"
                            openDelay={200}
                        >
                            <ActionIcon
                                size="input-sm"
                                variant="outline"
                                onClick={async () => {
                                    setEditingLabel(undefined);
                                }}
                            >
                                {editingLabel.id === TEMPORARY_ID && <MdOutlineClose />}
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            )}
            {!editingLabel && (
                <Tooltip
                    label="Add new Label"
                    openDelay={200}
                >
                    <ActionIcon
                        size="input-sm"
                        onClick={onCreateNewLabel}
                    >
                        <MdOutlineAdd />
                    </ActionIcon>
                </Tooltip>
            )}
        </Stack>
    );
};
