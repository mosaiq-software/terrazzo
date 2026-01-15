import { createReactInlineContentSpec } from '@blocknote/react';
import { Menu } from '@mantine/core';
import { COLORS } from '@trz/util/colors';
import { BlockNoteMentionPopup } from './BlockNoteMentionPopup';

export const BlockNoteMention = createReactInlineContentSpec(
    {
        type: 'mention',
        content: 'none',
        propSchema: {
            tag: {
                default: '',
            },
            id: {
                default: '',
            },
            type: {
                default: '',
            },
        },
    },
    {
        render: (props) => (
            <Menu
                width={400}
                position="bottom-end"
                arrowPosition="center"
                arrowSize={10}
                withArrow
                shadow="md"
                trigger="hover"
                closeOnClickOutside
                withinPortal
            >
                <Menu.Target>
                    <span style={{ backgroundColor: COLORS.accent.pink.darkMuted }}>
                        @{props.inlineContent.props.tag}
                    </span>
                </Menu.Target>
                <Menu.Dropdown>
                    <BlockNoteMentionPopup
                        type={props.inlineContent.props.type}
                        id={props.inlineContent.props.id}
                    />
                </Menu.Dropdown>
            </Menu>
        ),
    }
);
