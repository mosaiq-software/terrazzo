import { Avatar, Button, Divider, Group, Menu, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useOrg } from '@trz/contexts/org-context';
import { useUI } from '@trz/contexts/ui-context';
import { MdAdd, MdMailOutline } from 'react-icons/md';
import { useNavigate } from 'react-router';

interface OrganizationSelectorMenuProps {
    sidebarCollapsed: boolean;
}
export const OrganizationSelectorMenu = (props: OrganizationSelectorMenuProps) => {
    const navigate = useNavigate();
    const orgCtx = useOrg();
    const uiCtx = useUI();

    return (
        <Menu
            position={props.sidebarCollapsed ? 'right-start' : 'bottom-start'}
            width={200}
            withinPortal
            trigger="hover"
        >
            <Menu.Target>
                <Tooltip
                    disabled={!props.sidebarCollapsed}
                    label={orgCtx.active?.name}
                    withArrow
                    arrowPosition="side"
                    position="right"
                    openDelay={700}
                    closeDelay={200}
                >
                    <Button
                        display={'flex'}
                        variant={'subtle'}
                        px={0}
                        onClick={() => {
                            if (!orgCtx.active) return;
                            navigate(`/org/${orgCtx.active.id}`);
                        }}
                    >
                        {orgCtx.active && (
                            <Avatar
                                src={orgCtx.active.logoUrl ?? undefined}
                                name={orgCtx.active.name}
                                color={'initials'}
                                display={'inline-block'}
                                size={'sm'}
                            />
                        )}
                        <Text
                            c="#fff"
                            style={{
                                transition: `padding ${uiCtx.animationDuration}ms, width ${uiCtx.animationDuration}ms`,
                                textWrap: 'nowrap',
                                textAlign: 'left',
                                width: props.sidebarCollapsed ? '0px' : '220px',
                                paddingLeft: props.sidebarCollapsed ? '0px' : '5px',
                            }}
                        >
                            {orgCtx.active?.name ?? 'Select Organization'}
                        </Text>
                    </Button>
                </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Switch Organization</Menu.Label>
                {orgCtx.allOrganizations.map((org) => (
                    <Menu.Item key={org.id}>
                        <Group
                            wrap="nowrap"
                            gap={8}
                            px={0}
                            onClick={() => {
                                orgCtx.selectAndGoToOrganization(org.id);
                            }}
                        >
                            <Avatar
                                src={org.logoUrl ?? undefined}
                                name={org.name}
                                color={'initials'}
                                display={'inline-block'}
                                size={'sm'}
                            />
                            <Text
                                c="#fff"
                                style={{
                                    textWrap: 'nowrap',
                                    textAlign: 'left',
                                    textOverflow: 'ellipsis',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '130px',
                                }}
                            >
                                {org.name}
                            </Text>
                        </Group>
                    </Menu.Item>
                ))}
                <Divider my="xs" />
                <Menu.Item
                    onClick={() => {
                        modals.openContextModal({
                            modal: 'joinOrganization',
                            title: 'Join Organization',
                            innerProps: {},
                        });
                    }}
                >
                    <Group
                        wrap="nowrap"
                        gap={8}
                        px={0}
                    >
                        <MdMailOutline
                            size={'1.25rem'}
                            color="subtle"
                        />
                        <Text
                            c="subtle"
                            style={{
                                textWrap: 'nowrap',
                                textAlign: 'left',
                            }}
                        >
                            Join Organization
                        </Text>
                    </Group>
                </Menu.Item>
                <Menu.Item
                    onClick={() => {
                        modals.openContextModal({
                            modal: 'organization',
                            title: 'Create New Organization',
                            innerProps: {},
                        });
                    }}
                >
                    <Group
                        wrap="nowrap"
                        gap={8}
                        px={0}
                    >
                        <MdAdd
                            size={'1.25rem'}
                            color="subtle"
                        />
                        <Text
                            c="subtle"
                            style={{
                                textWrap: 'nowrap',
                                textAlign: 'left',
                            }}
                        >
                            Create Organization
                        </Text>
                    </Group>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
