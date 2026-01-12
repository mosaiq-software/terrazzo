import { Fieldset, Loader, TextInput } from '@mantine/core';
import { BoardHeader, BoardId, PermissibleAction } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateBoardField } from '@trz/emitters';
import { useBoard } from '@trz/hooks/useBoard';
import { useModulePermission } from '@trz/hooks/usePermissions';
import { COLORS } from '@trz/util/colors';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
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
    const [editedBoardCode, setEditedBoardCode] = useState<string>('');
    useEffect(() => {
        if (boardData?.boardCode) {
            setEditedBoardCode(boardData.boardCode);
        }
    }, [boardData?.boardCode]);

    const onSave = async (edits: Partial<BoardHeader>) => {
        try {
            if (!userCanEditBoard) {
                throw new Error('You do not have permission to edit this board.');
            }
            await updateBoardField(sockCtx, props.boardId, { ...edits });
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
            }}
            onSave={onSave}
            onClose={props.onClose}
            disabled={!userCanEditBoard}
        >
            <TextInput
                w="8rem"
                labelProps={{
                    c: COLORS.text.primary,
                }}
                label="Board Code"
                placeholder="#"
                value={editedBoardCode}
                onChange={(e) => {
                    setEditedBoardCode(e.currentTarget.value);
                }}
                onBlur={() => {
                    if (editedBoardCode !== boardData.boardCode) {
                        onSave({ boardCode: editedBoardCode });
                    }
                }}
                disabled={!userCanEditBoard}
            />
            <Fieldset
                legend="Labels"
                bg={COLORS.transparent}
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
