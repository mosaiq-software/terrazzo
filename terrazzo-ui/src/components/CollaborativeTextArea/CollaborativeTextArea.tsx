import { Alert } from '@mantine/core';
import { TextBlockId } from '@mosaiq/terrazzo-common';
import { TableComponents, TableExtension } from '@remirror/extension-react-tables';
import { YjsExtension } from '@remirror/extension-yjs';
import { i18nFormat } from '@remirror/i18n';
import { EditorComponent, EmojiPopupComponent, Remirror, RemirrorProps, ThemeProvider, useRemirror, UseThemeProps } from '@remirror/react';
import { AllStyledComponent } from '@remirror/styles/emotion';
import { useImageColor } from '@trz/hooks/useImageColor';
import { ProviderConfiguration, SocketIOProvider } from '@trz/util/yjsSocketProvier';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { AnyExtension, CreateEditorStateProps, IdentifierSchemaAttributes } from 'remirror';
import { AnnotationExtension, CalloutExtension, DropCursorExtension, EmojiExtension, ImageExtension, MentionAtomExtension, MentionAtomNodeAttributes, PlaceholderExtension, wysiwygPreset } from 'remirror/extensions';
import { ManagerOptions, SocketOptions } from 'socket.io-client';
import data from 'svgmoji/emoji.json';
import { Doc } from 'yjs';
import './CollaborativeTextAreaStyle.css';
import { CollabTextAreaToolbar } from './Toolbar';

export interface ReactEditorProps extends Pick<CreateEditorStateProps, 'stringHandler'>, Pick<RemirrorProps, 'initialContent' | 'editable' | 'autoFocus' | 'hooks' | 'i18nFormat' | 'locale' | 'supportedLocales'> {
    placeholder?: string;
    theme?: UseThemeProps['theme'];
}

const extraAttributes: IdentifierSchemaAttributes[] = [
    {
        identifiers: ['mention', 'emoji'],
        attributes: { role: { default: 'presentation' } },
    },
    { identifiers: ['mention'], attributes: { href: { default: null } } },
];

export interface SocialEditorProps extends Partial<ReactEditorProps> {}
// export interface SocialEditorProps extends Partial<ReactEditorProps>, Pick<MentionComponentProps, 'users' | 'tags'> {}

// interface MentionComponentProps<UserData extends MentionAtomNodeAttributes = MentionAtomNodeAttributes> {
//     users?: UserData[];
//     tags?: string[];
// }

// function MentionComponent({ users, tags }: MentionComponentProps) {
//     const [mentionState, setMentionState] = useState<MentionAtomState | null>();
//     const tagItems = useMemo(() => (tags ?? []).map((tag) => ({ id: tag, label: `#${tag}` })), [tags]);
//     const items = useMemo(() => {
//         if (!mentionState) {
//             return [];
//         }

//         const allItems = mentionState.name === 'at' ? users : tagItems;

//         if (!allItems) {
//             return [];
//         }

//         const query = mentionState.query.full.toLowerCase() ?? '';
//         return allItems.filter((item) => item.label.toLowerCase().includes(query)).sort();
//     }, [mentionState, users, tagItems]);

//     return (
//         <MentionAtomPopupComponent
//             onChange={setMentionState}
//             items={items}
//         />
//     );
// }

interface EditorWrapperProps extends PropsWithChildren<SocialEditorProps>, SharedCollaborativeTextAreaProps {}

const EditorWrapper = (props: EditorWrapperProps) => {
    const IDLE_COLOR = '#afafaf';
    const imgColor = useImageColor(props.avatarUrl);
    const [socketIOProvider, setSocketIOProvider] = useState<SocketIOProvider | undefined>();
    const [status, setStatus] = useState<string>('unknown');
    const [clients, setClients] = useState<string[]>([]);

    useEffect(() => {
        let _socketIOProvider: SocketIOProvider;
        const init = async () => {
            const doc = new Doc();
            const url = import.meta.env.SOCKET_URL;
            if (!url) throw new Error('SOCKET_URL environment variable is not set');
            const textBlockId = props.textBlockId;
            const pConf: ProviderConfiguration = {
                autoConnect: true,
            };
            const sockConf: Partial<ManagerOptions & SocketOptions> = {
                path: '/socket',
            };
            _socketIOProvider = new SocketIOProvider(url, textBlockId, doc, pConf, sockConf);
            setSocketIOProvider(_socketIOProvider);
        };
        init();

        return () => {
            _socketIOProvider?.destroy();
        };
    }, []);

    useEffect(() => {
        if (!socketIOProvider) {
            return;
        }
        socketIOProvider.awareness.on('change', () => setClients(Array.from(socketIOProvider.awareness.getStates().keys()).map((key) => `${key}`)));
        socketIOProvider.awareness.setLocalStateField('user', {
            name: props.name || 'Unknown User',
            color: props.idle ? IDLE_COLOR : (imgColor ?? props.color ?? 'black'),
        });
        socketIOProvider.on('status', ({ status: _status }: { status: string }) => {
            setStatus(_status);
        });
    }, [socketIOProvider, imgColor, props.color, props.idle, props.name]);

    if (!socketIOProvider) {
        return <div>Loading editor...</div>;
    }

    return (
        <AllStyledComponent>
            <ThemeProvider theme={props.theme}>
                {status === 'disconnected' && (
                    <Alert
                        variant="light"
                        color="red"
                        title="Offline"
                    >
                        Changes may not be saved!
                    </Alert>
                )}
                <Editor
                    socketIOProvider={socketIOProvider}
                    {...props}
                />
            </ThemeProvider>
        </AllStyledComponent>
    );
};

interface EditorProps extends EditorWrapperProps {
    socketIOProvider: SocketIOProvider;
}
const Editor = (props: EditorProps) => {
    const extensions = useCallback(() => {
        const extensions: AnyExtension[] = [
            new AnnotationExtension({}),
            new PlaceholderExtension({ placeholder: props.placeholder }),
            new TableExtension({}),
            new MentionAtomExtension({
                matchers: [
                    { name: 'at', char: '@' },
                    { name: 'tag', char: '#' },
                ],
            }),
            new EmojiExtension({ plainText: false, data: data as any, moji: 'noto' }),
            new YjsExtension({ getProvider: () => props.socketIOProvider }),
            new CalloutExtension({}),
            new ImageExtension({ enableResizing: true }),
            new DropCursorExtension({}),
            ...wysiwygPreset(),
        ];
        return extensions;
    }, [props.placeholder]);

    const { manager, state } = useRemirror({
        extensions,
        extraAttributes,
        stringHandler: props.stringHandler,
    });

    return (
        <Remirror
            manager={manager}
            i18nFormat={i18nFormat}
            initialContent={state}
        >
            <CollabTextAreaToolbar />
            <EditorComponent />
            <EmojiPopupComponent />
            {/* <MentionComponent
                users={props.users}
                tags={props.tags}
            /> */}
            <TableComponents />
            {props.children}
        </Remirror>
    );
};

interface SharedCollaborativeTextAreaProps {
    maxLineLength: number;
    textBlockId: TextBlockId;
    fontSize?: number;
    placeholder?: string;
    name?: string;
    color?: string;
    avatarUrl?: string;
    idle: boolean;
    users?: MentionAtomNodeAttributes[];
    tags?: string[];
}

export const CollaborativeTextArea = (props: SharedCollaborativeTextAreaProps) => {
    return (
        <EditorWrapper
            editable={true}
            {...props}
        />
    );
};
