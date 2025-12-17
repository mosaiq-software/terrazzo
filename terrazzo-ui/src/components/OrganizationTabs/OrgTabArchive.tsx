import { Box, Fieldset, Stack, Title } from '@mantine/core';
import { MembershipRecord, OrganizationHeader, TrzModuleType, UID } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateBoardField, updateDocumentMetadata } from '@trz/emitters';
import { updateDirectoryMetadata } from '@trz/emitters/directoryEmitters';
import { useDirectoryContents } from '@trz/hooks/useDirectoryContents';
import { NoteType, notify } from '@trz/util/notifications';
import { toTitleCase } from '@trz/util/textUtils';
import { useMemo } from 'react';
import { ModuleIcon } from '../ModuleSettings/ModuleSettingDirectory';
import { ActionRow } from '../UI/ActionRow';

interface OrgTabArchiveProps {
    myMembershipRecord: MembershipRecord;
    orgData: OrganizationHeader;
}
export const OrgTabArchive = (props: OrgTabArchiveProps) => {
    const sockCtx = useSocket();
    const contents = useDirectoryContents(props.orgData.id, TrzModuleType.Organization);

    const archivedSubitems = useMemo(() => {
        if (!contents) {
            return [];
        }
        return contents.filter((item) => item.archived && item.canAccess);
    }, [contents]);

    const onUnarchiveSubitem = async (itemId: UID, itemType: TrzModuleType) => {
        try {
            switch (itemType) {
                case TrzModuleType.Directory:
                    await updateDirectoryMetadata(sockCtx, itemId, { archived: false });
                    break;
                case TrzModuleType.Document:
                    await updateDocumentMetadata(sockCtx, itemId, { archived: false });
                    break;
                case TrzModuleType.Board:
                    await updateBoardField(sockCtx, itemId, { archived: false });
                    break;
                default:
                    throw new Error('Unsupported module type');
            }
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
            <Title
                c="white"
                pb="20"
                order={4}
                maw="200"
            >
                Settings
            </Title>
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
                    bg="transparent"
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
