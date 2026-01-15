import { ActionIcon, Button, MantineSize, Menu, Pill, Stack, Tooltip } from '@mantine/core';
import { Card, Label, LabelId } from '@mosaiq/terrazzo-common';
import { useSocket } from '@trz/contexts/socket-context';
import { updateCardsLabels } from '@trz/emitters';
import { COLORS } from '@trz/util/colors';
import { colorIsDarkAdvanced } from '@trz/util/colorUtils';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { MdCheck, MdLabel, MdLabelOutline } from 'react-icons/md';

interface LabelsMenuProps {
    card: Card;
    boardLabels: Label[];
    viewOnly?: boolean;
}

export const LabelsMenu = (props: LabelsMenuProps) => {
    const sockCtx = useSocket();

    return (
        <Menu
            position="bottom-start"
            withArrow
            arrowPosition="side"
            closeOnClickOutside={true}
            trigger="hover"
            closeDelay={200}
            opened={!props.boardLabels.length ? false : undefined}
        >
            <Menu.Target>
                {props.boardLabels.length ? (
                    props.viewOnly ? (
                        <LabelDisplay
                            labels={props.card.labels}
                            size="sm"
                            boardLabels={props.boardLabels}
                        />
                    ) : (
                        <Button
                            variant="subtle"
                            justify={'flex-start'}
                        >
                            <LabelDisplay
                                labels={props.card.labels}
                                showAdd
                                size="sm"
                                boardLabels={props.boardLabels}
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
                    {props.boardLabels.map((label) => {
                        const textColor = colorIsDarkAdvanced(label.color)
                            ? COLORS.text.primary
                            : COLORS.background.dark;
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
                                            visibility: props.card.labels.includes(label.id) ? 'visible' : 'hidden',
                                        }}
                                    />
                                }
                                onClick={() => {
                                    const labels = props.card.labels;
                                    if (labels.includes(label.id)) {
                                        labels.splice(labels.indexOf(label.id), 1);
                                    } else {
                                        labels.push(label.id);
                                    }
                                    updateCardsLabels(sockCtx, props.card.id, labels);
                                }}
                            >
                                {label.name}
                            </Button>
                        );
                    })}
                </Stack>
            </Menu.Dropdown>
        </Menu>
    );
};

interface LabelDisplayProps {
    labels: LabelId[];
    showAdd?: boolean;
    size?: MantineSize;
    boardLabels: Label[];
}
export const LabelDisplay = (props: LabelDisplayProps) => {
    return (
        <Pill.Group>
            {props.labels.map((labelId) => {
                const label = props.boardLabels.filter((l) => l.id === labelId)[0];
                if (!label) return null;
                const textColor = colorIsDarkAdvanced(label.color) ? COLORS.text.primary : COLORS.background.dark;
                return (
                    <Pill
                        key={label.id}
                        size={props.size}
                        bg={label.color}
                        c={textColor}
                    >
                        {label.name}
                    </Pill>
                );
            })}
            {props.showAdd && !props.labels.length && (
                <MdLabel
                    size="1.5rem"
                    color={COLORS.text.primary}
                />
            )}
        </Pill.Group>
    );
};
