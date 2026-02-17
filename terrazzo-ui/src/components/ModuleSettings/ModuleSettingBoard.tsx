import { Fieldset, Loader, TextInput } from '@mantine/core';
import { ModuleHeader, ModuleId, PermissibleAction, TrzModule } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateModuleField } from '@trz/emitters';
import { useModulePermission } from '@trz/hooks/data/usePermissions';
import { useLabels } from '@trz/hooks/useLabels';
import { useModule } from '@trz/hooks/useModule';
import { COLORS } from '@trz/util/colors';
import { NoteType, notify } from '@trz/util/notifications';
import { useEffect, useState } from 'react';
import { NotFound } from '../UI/NotFound';
import { LabelEditor } from './LabelEditor';
import { ModuleSettingsLayout } from './ModuleSettingsLayout';

interface ModuleSettingsBoardProps {
    boardId: ModuleId;
    onClose: () => void;
}

export const ModuleSettingsBoard = (props: ModuleSettingsBoardProps) => {
    const sockCtx = useSocket();
    const boardData = useModule(props.boardId, TrzModule.Board);
    const boardLabels = useLabels(props.boardId);
    const userCanViewBoard = useModulePermission(boardData, PermissibleAction.ViewModules);
    const userCanEditBoard = useModulePermission(boardData, PermissibleAction.ManageModules);
    const [editedBoardCode, setEditedBoardCode] = useState<string>('');
    useEffect(() => {
        if (boardData?.data.boardCode) {
            setEditedBoardCode(boardData.data.boardCode);
        }
    }, [boardData?.data.boardCode]);

    const onSave = async (edits: Partial<ModuleHeader<TrzModule.Board>>) => {
        try {
            if (!userCanEditBoard) {
                throw new Error('You do not have permission to edit this board.');
            }
            await updateModuleField(sockCtx, props.boardId, {
                type: TrzModule.Board,
                update: edits,
            });
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
        <ModuleSettingsLayout<TrzModule.Board>
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
                    if (editedBoardCode !== boardData.data.boardCode) {
                        onSave({ data: { boardCode: editedBoardCode } });
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
