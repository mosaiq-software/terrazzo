import { createReactInlineContentSpec } from '@blocknote/react';
import { COLORS } from '@trz/util/colors';

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
            <span style={{ backgroundColor: COLORS.accent.pink.light }}>@{props.inlineContent.props.tag}</span>
        ),
    }
);
