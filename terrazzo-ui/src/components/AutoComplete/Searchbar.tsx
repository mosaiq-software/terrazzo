import { Button, Divider, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useDebouncedCallback, useHotkeys } from '@mantine/hooks';
import { QueryableItem, ScoredQueryableDatapoint } from '@mosaiq/terrazzo-common';
import { useOrg } from '@trz/contexts/org-context';
import { useSocket } from '@trz/contexts/socket-context';
import { getSearchResults } from '@trz/emitters';
import React, { useState } from 'react';
import { BsCardText } from 'react-icons/bs';
import { IoDocumentOutline } from 'react-icons/io5';
import { MdOutlineIncompleteCircle, MdOutlineViewKanban } from 'react-icons/md';
import { useNavigate } from 'react-router';

export function SearchBar() {
    const [searchSessionId, setSearchSessionId] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const sockCtx = useSocket();
    const navigate = useNavigate();
    const orgCtx = useOrg();

    useHotkeys([
        [
            '/',
            () => {
                if (!searchSessionId) {
                    startNewSearchSession();
                }
            },
        ],
    ]);

    const debouncedSearch = useDebouncedCallback(async () => {
        if (!searchQuery || searchQuery.trim().length === 0) {
            setSearchResults([]);
            return;
        }
        if (!searchSessionId) {
            console.error('No active search session ID');
            return;
        }
        if (!orgCtx.active) {
            console.error('No active organization context');
            return;
        }
        const res = await getSearchResults(sockCtx, searchQuery, searchSessionId, orgCtx.active.id);
        setSearchResults(res?.results || []);
    }, 300);

    const startNewSearchSession = () => {
        const newSessionId = crypto.randomUUID();
        setSearchSessionId(newSessionId);
    };

    const endSearchSession = () => {
        setSearchSessionId(undefined);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prevIndex) => (prevIndex + 1) % searchResults.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prevIndex) => (prevIndex - 1 + searchResults.length) % searchResults.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
                    const selectedResult = searchResults[highlightedIndex];
                    const extra = getExtra(selectedResult.type, selectedResult.id);
                    navigate(extra.link);
                    endSearchSession();
                }
                break;
            case 'Escape':
                endSearchSession();
                break;
        }
    };

    if (!orgCtx.active) {
        return null;
    }

    return (
        <>
            <TextInput
                onClick={startNewSearchSession}
                readOnly
                value={`Search ${orgCtx.active.name}...`}
                rightSection={
                    <Text
                        span
                        style={{ pointerEvents: 'none', color: 'gray' }}
                        fz="xs"
                    >
                        {'/'}
                    </Text>
                }
            />
            <Modal.Root
                opened={searchSessionId !== undefined}
                onClose={endSearchSession}
            >
                <Modal.Overlay />
                <Modal.Content>
                    <Modal.Body>
                        <TextInput
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.currentTarget.value);
                                debouncedSearch();
                            }}
                            placeholder={`Search ${orgCtx.active.name}...`}
                            autoFocus
                            onKeyDown={handleKeyDown}
                        />
                        {searchQuery.trim().length === 0 ? null : (
                            <Stack>
                                {searchResults.length === 0 ? <Text>No results found</Text> : null}
                                <Divider />
                                {searchResults.map((result, index) => (
                                    <RenderedSearchResult
                                        key={index}
                                        result={result}
                                        highlighted={index === highlightedIndex}
                                        onClose={endSearchSession}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
}

interface RenderedSearchResultProps {
    result: ScoredQueryableDatapoint;
    highlighted: boolean;
    onClose: () => void;
}
const RenderedSearchResult = (props: RenderedSearchResultProps) => {
    const { id, display, type } = props.result;
    const extra = getExtra(type, id);
    const navigate = useNavigate();

    return (
        <Button
            variant={props.highlighted ? 'light' : 'subtle'}
            onClick={() => {
                navigate(extra.link);
                props.onClose();
            }}
            style={{
                height: '100%',
                width: '100%',
            }}
            styles={{
                inner: {
                    width: '100%',
                },
                label: {
                    width: '100%',
                },
            }}
            fullWidth
            justify="left"
        >
            <Group
                wrap="nowrap"
                justify="space-between"
                w="100%"
            >
                <Stack
                    gap={2}
                    w="85%"
                >
                    <Text
                        fw={500}
                        ta="left"
                        w="100%"
                        truncate
                    >
                        {display}
                    </Text>
                </Stack>
                <extra.icon size={16} />
            </Group>
        </Button>
    );
};

const getExtra = (type: QueryableItem, id: string) => {
    switch (type) {
        case QueryableItem.Board:
            return {
                link: `/board/${id}`,
                icon: MdOutlineViewKanban,
            };
        case QueryableItem.Card:
            return {
                link: `/card/${id}`,
                icon: BsCardText,
            };
        case QueryableItem.Document:
            return {
                link: `/doc/${id}`,
                icon: IoDocumentOutline,
            };
        default:
            return {
                link: '#',
                icon: MdOutlineIncompleteCircle,
            };
    }
};
