import { Box, Fieldset, Stack } from '@mantine/core';
import { ModuleType, OrganizationId, UID } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateModuleField } from '@trz/emitters';
import { COLORS } from '@trz/util/colors';
import { ModuleIcon } from '@trz/util/moduleUtils';
import { NoteType, notify } from '@trz/util/notifications';
import { toTitleCase } from '@trz/util/textUtils';
import { useMemo } from 'react';
import { ActionRow } from '../UI/ActionRow';
import { useModuleChildren } from '@trz/hooks/data/useModuleChildren';

interface OrgTabArchiveProps {
    orgId: OrganizationId;
}
export const OrgTabArchive = (props: OrgTabArchiveProps) => {
    const sockCtx = useSocket();
    const contents = useModuleChildren(props.orgId);
    const archivedSubitems = useMemo(() => {
        if (!contents) {
            return [];
        }
        return contents.filter((item) => item.archived && item.canAccess);
    }, [contents]);

    const onUnarchiveSubitem = async (itemId: UID, itemType: ModuleType) => {
        try {
            await updateModuleField(sockCtx, itemId, {
                type: itemType,
                update: { archived: false },
            });
            notify(NoteType.CHANGES_SAVED);
        } catch (e) {
            notify(NoteType.DOC_UPDATE_ERROR, e);
        }
    };
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                width: '100%',
            }}
        >
            <Box
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Fieldset
                    legend="Archived Items"
                    w="100%"
                    bg={COLORS.transparent}
                >
                    <Stack>
                        {archivedSubitems.length === 0 && 'No archived items in this directory.'}
                        {archivedSubitems.map((item) => (
                            <ActionRow
                                key={item.id}
                                title={item.name}
                                subtitle={toTitleCase(item.type)}
                                icon={ModuleIcon({ moduleType: item.type })}
                                menuItems={[
                                    {
                                        label: `Unarchive ${item.type}`,
                                        onClick: () => onUnarchiveSubitem(item.id, item.type),
                                    },
                                ]}
                            />
                        ))}
                    </Stack>
                </Fieldset>
            </Box>
        </Box>
    );
};
