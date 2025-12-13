import { Fieldset, Loader, TextInput } from '@mantine/core';
import { BoardHeader, BoardId, PermissibleAction } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateBoardField } from '@trz/emitters';
import { useBoard } from '@trz/hooks/useBoard';
import { useModulePermission } from '@trz/hooks/usePermissions';
import { NoteType, notify } from '@trz/util/notifications';
import { useState } from 'react';
import { NotFound } from '../UI/NotFound';
import { LabelEditor } from './LabelEditor';
import { ModuleSettingsLayout } from './ModuleSettingsLayout';

interface ModuleSettingsBoardProps {
    boardId: BoardId;
    onClose: () => void;
}

export const ModuleSettingsBoard = (props: ModuleSettingsBoardProps) => {
    const sockCtx = useSocket();
    const { boardData, boardLabels } = useBoard(props.boardId);
    const userCanViewBoard = useModulePermission(boardData, PermissibleAction.ViewBoard);
    const userCanEditBoard = useModulePermission(boardData, PermissibleAction.EditBoard);
    const [boardEdits, setBoardEdits] = useState<Partial<BoardHeader>>({});

    const onSave = async () => {
        try {
            if (!userCanEditBoard) {
                throw new Error('You do not have permission to edit this board.');
            }
            await updateBoardField(sockCtx, props.boardId, boardEdits);
            setBoardEdits({});
        } catch (e) {
            notify(NoteType.BOARD_DATA_ERROR, e);
        }
    };

    if (!boardData) {
        return <Loader />;
    }

    if (!userCanViewBoard) {
        return (
            <NotFound
                itemType="board"
                error={403}
            />
        );
    }

    return (
        <ModuleSettingsLayout
            moduleHeader={{
                ...boardData,
                ...boardEdits,
            }}
            onChangeTitle={(newTitle) => {
                setBoardEdits({ ...boardEdits, name: newTitle });
            }}
            onChangePermissions={(newPermissions) => {
                setBoardEdits({ ...boardEdits, desiredPermissions: newPermissions });
            }}
            saved={Object.keys(boardEdits).length === 0}
            onSave={onSave}
            onClose={props.onClose}
            disabled={!userCanEditBoard}
        >
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
                disabled={!userCanEditBoard}
            />
            <Fieldset
                legend="Labels"
                bg="transparent"
            >
                <LabelEditor
                    labels={boardLabels}
                    boardId={props.boardId}
                    disableEditing={!userCanEditBoard}
                />
            </Fieldset>
        </ModuleSettingsLayout>
    );
};
