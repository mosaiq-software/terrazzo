import { Button, Fieldset, Loader, Stack, TextInput } from '@mantine/core';
import { BoardHeader, BoardId } from '@mosaiq/terrazzo-common/types';
import { useSocket } from '@trz/contexts/socket-context';
import { updateBoardField } from '@trz/emitters';
import { useBoard } from '@trz/hooks/useBoard';
import { NoteType, notify } from '@trz/util/notifications';
import { useState } from 'react';
import { LabelEditor } from './LabelEditor';
import { PermissionsEditor } from './PermissionsEditor/PermissionsEditor';

interface ModuleSettingsBoardProps {
    boardId: BoardId;
    onClose: () => void;
}

export const ModuleSettingsBoard = (props: ModuleSettingsBoardProps) => {
    const sockCtx = useSocket();
    const { boardData, boardLabels } = useBoard(props.boardId);
    const [boardEdits, setBoardEdits] = useState<Partial<BoardHeader>>({});

    const onSave = async () => {
        try {
            await updateBoardField(sockCtx, props.boardId, boardEdits);
            setBoardEdits({});
            props.onClose();
        } catch (e) {
            notify(NoteType.BOARD_DATA_ERROR, e);
        }
    };

    if (!boardData) {
        return <Loader />;
    }

    return (
        <Stack>
            <TextInput
                labelProps={{
                    c: 'white',
                }}
                label="Board Name"
                placeholder="My Board"
                required
                value={boardEdits.name ?? boardData.name ?? ''}
                onChange={(e) => {
                    setBoardEdits({ ...boardEdits, name: e.target.value });
                }}
            />
            <TextInput
                w="8rem"
                labelProps={{
                    c: 'white',
                }}
                label="Board Code"
                placeholder="#"
                value={boardEdits.boardCode ?? boardData.boardCode ?? ''}
                onChange={(e) => {
                    setBoardEdits({ ...boardEdits, boardCode: e.target.value });
                }}
            />
            <PermissionsEditor
                desiredPermissions={boardEdits.desiredPermissions ?? boardData.desiredPermissions}
                onChange={(newPermissions) => {
                    setBoardEdits({ ...boardEdits, desiredPermissions: newPermissions });
                }}
            />
            <Button
                disabled={Object.keys(boardEdits).length === 0}
                onClick={onSave}
            >
                Save Changes
            </Button>
            <Fieldset
                legend="Labels"
                bg="transparent"
            >
                <LabelEditor
                    labels={boardLabels}
                    boardId={props.boardId}
                />
            </Fieldset>
        </Stack>
    );
};
