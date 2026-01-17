import { createReactInlineContentSpec } from '@blocknote/react';
import { BlockNoteMentionWithPopup } from './BlockNoteMentionPopup';

export const BlockNoteMention = createReactInlineContentSpec(
    {
        type: 'mention',
        content: 'none',
        propSchema: {
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
            <BlockNoteMentionWithPopup
                type={props.inlineContent.props.type}
                id={props.inlineContent.props.id}
            />
        ),
    }
);
