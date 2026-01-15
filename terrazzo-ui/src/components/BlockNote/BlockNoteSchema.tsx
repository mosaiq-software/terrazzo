import { codeBlockOptions } from '@blocknote/code-block';
import { BlockNoteSchema, createCodeBlockSpec } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { DefaultReactSuggestionItem, SuggestionMenuController } from '@blocknote/react';
import { useDebouncedCallback } from '@mantine/hooks';
import { QueryTag } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { getSearchTags } from '@trz/emitters';
import { useCallback, useState } from 'react';
import { blockNoteEditorTheme } from './BlockNoteEditorTheme';
import { BlockNoteMention } from './Custom/BlockNoteMention';

export const BNSchema = BlockNoteSchema.create().extend({
    blockSpecs: {
        codeBlock: createCodeBlockSpec(codeBlockOptions),
    },
    inlineContentSpecs: {
        mention: BlockNoteMention,
    },
});

interface CustomBlockNoteViewerProps {
    editor: typeof BNSchema.BlockNoteEditor;
    style?: React.CSSProperties;
}

const SEARCH_SESSION_TIMEOUT_MS = 1000 * 30; // 30 seconds

export const CustomBlockNoteViewer = (props: CustomBlockNoteViewerProps) => {
    const [searchSession, setSearchSession] = useState<{ id: string; expires: number } | undefined>(undefined);
    const [searchResults, setSearchResults] = useState<QueryTag[]>([]);
    const sockCtx = useSocket();
    const orgCtx = useOrg();

    const debouncedSearch = useDebouncedCallback(async (query: string) => {
        if (!query || query.trim().length === 0) {
            setSearchResults([]);
            return [];
        }
        if (!orgCtx.active) {
            console.error('No active organization context');
            return [];
        }

        let session = searchSession;
        const now = Date.now();
        if (!session || session.expires < now) {
            // Create new search session
            session = { id: crypto.randomUUID(), expires: now + SEARCH_SESSION_TIMEOUT_MS };
            setSearchSession(session);
        }

        const res = await getSearchTags(sockCtx, query, session.id, orgCtx.active.id);
        setSearchResults(res?.tags || []);
    }, 300);

    const handleGetMentionMenuItems = useCallback(
        async (query: string): Promise<DefaultReactSuggestionItem[]> => {
            debouncedSearch(query);
            return getMentionMenuItems(props.editor, searchResults);
        },
        [props.editor, searchResults, debouncedSearch]
    );

    return (
        <BlockNoteView
            theme={blockNoteEditorTheme}
            editor={props.editor}
            style={props.style}
        >
            <SuggestionMenuController
                triggerCharacter={'@'}
                minQueryLength={1}
                getItems={handleGetMentionMenuItems}
            />
        </BlockNoteView>
    );
};

export const getMentionMenuItems = (
    editor: typeof BNSchema.BlockNoteEditor,
    searchTags: QueryTag[]
): DefaultReactSuggestionItem[] => {
    return searchTags.map((tag) => ({
        title: tag.name,
        onItemClick: () => {
            editor.insertInlineContent([
                {
                    type: 'mention',
                    props: {
                        tag: tag.name,
                        id: tag.id,
                        type: tag.type,
                    },
                },
                ' ',
            ]);
        },
    }));
};
