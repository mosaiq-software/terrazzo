import { codeBlockOptions } from '@blocknote/code-block';
import { Block, BlockNoteSchema, createCodeBlockSpec } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect } from 'react';
import { blockNoteEditorTheme } from './BlockNoteEditorTheme';
import './BlockNoteStyleOverrides.css';

interface BaseEditorProps {
    content: Block[];
}
/**
 */
export const ReadonlyBlockNote = (props: BaseEditorProps) => {
    const editor = useCreateBlockNote(
        {
            schema: BlockNoteSchema.create().extend({
                blockSpecs: {
                    codeBlock: createCodeBlockSpec(codeBlockOptions),
                },
            }),
            initialContent: props.content,
        },
        [props.content]
    );

    useEffect(() => {
        if (editor) {
            editor.isEditable = false;
        }
    }, [editor]);

    return (
        <BlockNoteView
            editor={editor}
            theme={blockNoteEditorTheme}
            style={{
                width: '100%',
            }}
        />
    );
};
