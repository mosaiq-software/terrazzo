import { Block } from '@blocknote/core';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect } from 'react';
import { BNSchema, CustomBlockNoteViewer } from './BlockNoteSchema';
import './BlockNoteStyleOverrides.css';

interface BaseEditorProps {
    content: Block[];
}
/**
 */
export const ReadonlyBlockNote = (props: BaseEditorProps) => {
    const editor = useCreateBlockNote(
        {
            schema: BNSchema,
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
        <CustomBlockNoteViewer
            editor={editor}
            style={{
                width: '100%',
            }}
        />
    );
};
