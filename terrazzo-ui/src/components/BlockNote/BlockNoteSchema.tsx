import { codeBlockOptions } from '@blocknote/code-block';
import { BlockNoteSchema, createCodeBlockSpec, defaultInlineContentSpecs } from '@blocknote/core';
import { filterSuggestionItems } from '@blocknote/core/extensions';
import { BlockNoteView } from '@blocknote/mantine';
import { DefaultReactSuggestionItem, SuggestionMenuController } from '@blocknote/react';
import { blockNoteEditorTheme } from './BlockNoteEditorTheme';
import { BlockNoteMention } from './Custom/BlockNoteMention';

export const BNSchema = BlockNoteSchema.create().extend({
    blockSpecs: {
        codeBlock: createCodeBlockSpec(codeBlockOptions),
    },
    inlineContentSpecs: {
        ...defaultInlineContentSpecs,
        mention: BlockNoteMention,
    },
});

interface CustomBlockNoteViewerProps {
    editor: typeof BNSchema.BlockNoteEditor;
    style?: React.CSSProperties;
}
export const CustomBlockNoteViewer = (props: CustomBlockNoteViewerProps) => {
    return (
        <BlockNoteView
            theme={blockNoteEditorTheme}
            editor={props.editor}
            style={props.style}
        >
            <SuggestionMenuController
                triggerCharacter={'@'}
                getItems={async (query) => filterSuggestionItems(getMentionMenuItems(props.editor), query)}
            />
        </BlockNoteView>
    );
};

export const getMentionMenuItems = (editor: typeof BNSchema.BlockNoteEditor): DefaultReactSuggestionItem[] => {
    const users = ['Steve', 'Bob', 'Joe', 'Mike'];
    return users.map((user) => ({
        title: user,
        onItemClick: () => {
            editor.insertInlineContent([
                {
                    type: 'mention',
                    props: {
                        user,
                    },
                },
                ' ', // add a space after the mention
            ]);
        },
    }));
};
