import { codeBlockOptions } from '@blocknote/code-block';
import { BlockNoteSchema, createCodeBlockSpec } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import { DefaultReactSuggestionItem, SuggestionMenuController } from '@blocknote/react';
import { QueryTag } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { getSearchTags } from '@trz/emitters';
import { useCallback, useRef, useState } from 'react';
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
    const searchSessionRef = useRef<{ id: string; expires: number } | undefined>(undefined);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const pendingSearchRef = useRef<((tags: QueryTag[]) => void) | null>(null);
    const sockCtx = useSocket();
    const orgCtx = useOrg();

    const performSearch = useCallback(
        (query: string): Promise<QueryTag[]> => {
            return new Promise((resolve) => {
                if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                }
                if (pendingSearchRef.current) {
                    pendingSearchRef.current([]);
                }
                pendingSearchRef.current = resolve;

                searchTimeoutRef.current = setTimeout(async () => {
                    if (!query || query.trim().length === 0) {
                        setSearchResults([]);
                        pendingSearchRef.current?.([]);
                        pendingSearchRef.current = null;
                        return;
                    }
                    if (!orgCtx.active) {
                        console.error('No active organization context');
                        setSearchResults([]);
                        pendingSearchRef.current?.([]);
                        pendingSearchRef.current = null;
                        return;
                    }

                    let session = searchSessionRef.current;
                    const now = Date.now();
                    if (!session || session.expires < now) {
                        session = { id: crypto.randomUUID(), expires: now + SEARCH_SESSION_TIMEOUT_MS };
                        searchSessionRef.current = session;
                        setSearchSession(session);
                    }

                    const res = await getSearchTags(sockCtx, query, session.id, orgCtx.active.id);
                    const tags = res?.tags || [];
                    setSearchResults(tags);
                    pendingSearchRef.current?.(tags);
                    pendingSearchRef.current = null;
                }, 300);
            });
        },
        [orgCtx.active, sockCtx]
    );

    const handleGetMentionMenuItems = useCallback(
        async (query: string): Promise<DefaultReactSuggestionItem[]> => {
            const tags = await performSearch(query);
            return getMentionMenuItems(props.editor, tags);
        },
        [props.editor, performSearch]
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
