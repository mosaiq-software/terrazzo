import { Avatar, Button, Divider, Group, Menu, Text, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useTRZ } from '@trz/contexts/TRZ-context';
import { MdAdd } from 'react-icons/md';
import { useNavigate } from 'react-router';

interface OrganizationSelectorMenuProps {
    sidebarCollapsed: boolean;
}
export const OrganizationSelectorMenu = (props: OrganizationSelectorMenuProps) => {
    const trz = useTRZ();
    const navigate = useNavigate();
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
                    label={trz.selectedOrganization?.name}
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
                            if (!trz.selectedOrganization) return;
                            navigate(`/org/${trz.selectedOrganization.id}`);
                        }}
                    >
                        {trz.selectedOrganization && (
                            <Avatar
                                src={trz.selectedOrganization.logoUrl ?? undefined}
                                name={trz.selectedOrganization.name}
                                color={'initials'}
                                display={'inline-block'}
                                size={'sm'}
                            />
                        )}
                        <Text
                            c="#fff"
                            style={{
                                transition: `padding ${trz.animationDuration}ms, width ${trz.animationDuration}ms`,
                                textWrap: 'nowrap',
                                textAlign: 'left',
                                width: props.sidebarCollapsed ? '0px' : '220px',
                                paddingLeft: props.sidebarCollapsed ? '0px' : '5px',
                            }}
                        >
                            {trz.selectedOrganization?.name ?? 'Select Organization'}
                        </Text>
                    </Button>
                </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Switch Organization</Menu.Label>
                {trz.allOrganizations.map((org) => (
                    <Menu.Item key={org.id}>
                        <Group
                            wrap="nowrap"
                            gap={8}
                            px={0}
                            onClick={() => {
                                trz.selectOrganization(org.id);
                                navigate(`/org/${org.id}`);
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
