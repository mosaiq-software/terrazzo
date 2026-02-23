import { ActionIcon, Button, MantineSize, Menu, Pill, Stack, Tooltip } from '@mantine/core';
import { LabelId, ModuleId } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateCardsLabels } from '@trz/emitters';
import { useLabel } from '@trz/hooks/data/useLabel';
import { useLabels } from '@trz/hooks/data/useLabels';
import { COLORS } from '@trz/util/colors';
import { colorIsDarkAdvanced } from '@trz/util/colorUtils';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { MdCheck, MdLabel, MdLabelOutline } from 'react-icons/md';

interface LabelsMenuProps {
    moduleId: ModuleId;
    viewOnly?: boolean;
}

export const LabelsMenu = (props: LabelsMenuProps) => {
    const sockCtx = useSocket();
    const labels = useLabels(props.moduleId);

    return (
        <Menu
            position="bottom-start"
            withArrow
            arrowPosition="side"
            closeOnClickOutside={true}
            trigger="hover"
            closeDelay={200}
            opened={!labels.length ? false : undefined}
        >
            <Menu.Target>
                {labels.length ? (
                    props.viewOnly ? (
                        <StaticLabelDisplay
                            labels={cardLabels}
                            size="sm"
                        />
                    ) : (
                        <Button
                            variant="subtle"
                            justify={'flex-start'}
                        >
                            <StaticLabelDisplay
                                labels={cardLabels}
                                showAdd
                                size="sm"
                            />
                        </Button>
                    )
                ) : props.viewOnly ? (
                    <MdLabelOutline
                        size="1.5rem"
                        color={COLORS.foreground.medium}
                    />
                ) : (
                    <Tooltip label="No labels available. Create labels in board settings to assign them to cards.">
                        <ActionIcon
                            variant="subtle"
                            c={COLORS.text.primary}
                        >
                            <IoMdInformationCircleOutline size="1.5rem" />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Menu.Target>
            <Menu.Dropdown
                ta="center"
                miw="10rem"
            >
                <Menu.Label>Labels</Menu.Label>
                <Stack gap={1}>
                    {labels.map((label) => (
                        <ClickableLabel
                            key={label.id}
                            labelId={label.id}
                            selected={props.card.labels.includes(label.id)}
                            onClick={async () => {
                                const labels = props.card.labels;
                                if (labels.includes(label.id)) {
                                    labels.splice(labels.indexOf(label.id), 1);
                                } else {
                                    labels.push(label.id);
                                }
                                await updateCardsLabels(sockCtx, props.card.id, labels);
                            }}
                        />
                    ))}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};

interface LabelDisplayProps {
    labels: LabelId[];
    showAdd?: boolean;
    size?: MantineSize;
}
export const StaticLabelDisplay = (props: LabelDisplayProps) => {
    return (
        <Pill.Group>
            {props.labels.map((labelId) => (
                <StaticLabel
                    key={labelId}
                    labelId={labelId}
                />
            ))}
            {props.showAdd && !props.labels.length && (
                <MdLabel
                    size="1.5rem"
                    color={COLORS.text.primary}
                />
            )}
        </Pill.Group>
    );
};

interface LabelProps {
    labelId: LabelId;
}
export const StaticLabel = (props: LabelProps) => {
    const label = useLabel(props.labelId);
    if (!label) return null;
    const textColor = colorIsDarkAdvanced(label.color) ? COLORS.text.primary : COLORS.background.dark;
    return (
        <Pill
            size="xs"
            bg={label.color}
            c={textColor}
        >
            {label.name}
        </Pill>
    );
};

interface ClickableLabelProps {
    labelId: LabelId;
    selected: boolean;
    onClick: () => void;
}
export const ClickableLabel = (props: ClickableLabelProps) => {
    const label = useLabel(props.labelId);
    if (!label) return null;
    const textColor = colorIsDarkAdvanced(label.color) ? COLORS.text.primary : COLORS.background.dark;
    return (
        <Button
            key={label.id}
            bg={label.color}
            ta="left"
            justify="start"
            c={textColor}
            style={{
                borderRadius: '4px',
            }}
            leftSection={
                <MdCheck
                    style={{
                        visibility: props.selected ? 'visible' : 'hidden',
                    }}
                />
            }
            onClick={props.onClick}
        >
            {label.name}
        </Button>
    );
};
