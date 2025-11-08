import { Box, Button, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

const AUTO_CLOSE_TIMEOUT = 5000;
const LONG_NOTIFICATION_TIMEOUT = 10000;
export enum NoteColor {
    ERROR = 'red',
    INFO = 'blue',
    WARNING = 'yellow',
    SUCCESS = 'green',
}
interface Note {
    title: string;
    message?: string;
    color?: NoteColor;
    persist?: boolean;
    timeout?: number;
    primary?: string;
    secondary?: string;
}
export const NoteType = {
    CONNECTION_ERROR: {
        title: 'Connection Error',
        message: 'An error occurred while connecting to the server. Could not upgrade to websocket',
    },
    DISCONNECTED: {
        title: 'Disconnected',
        message: 'You have been disconnected from the server',
    },
    RECONNECTING: {
        title: 'Reconnecting',
        message: 'Searching for server...',
        color: NoteColor.INFO,
    },
    RECONNECTING_SERVER_FOUND: {
        title: 'Reconnecting',
        message: 'Server found. Attempting to reconnect',
        color: NoteColor.INFO,
    },
    CONNECTION_ESTABLISHED: {
        title: 'Connected',
        message: 'You have been connected to the server',
        color: NoteColor.SUCCESS,
    },
    SOCKET_ROOM_ERROR: {
        title: 'Room Error',
        message: 'There was an error connecting you to the room $',
    },
    GITHUB_AUTH_ERROR: {
        title: 'GitHub Authentication Error',
        message: 'An error occurred while authenticating with GitHub',
    },
    GITHUB_DATA_ERROR: {
        title: 'GitHub Data Error',
        message: 'An error occurred while fetching data from GitHub',
    },
    BOARD_DATA_ERROR: {
        title: 'Board Data Error',
        message: 'An error occurred while fetching data from Board',
    },
    BOARD_CREATION_ERROR: {
        title: 'Board Creation Error',
        message: 'An error occurred while creating a new board',
    },
    LIST_CREATION_ERROR: {
        title: 'List Creation Error',
        message: 'An error occurred while creating a new list',
    },
    LIST_DATA_ERROR: {
        title: 'There was an error getting a list',
    },
    CARD_DATA_ERROR: {
        title: 'There was an error getting a card',
    },
    CARD_CREATION_ERROR: {
        title: 'Card Creation Error',
        message: 'An error occurred while creating a new card',
    },
    LIST_UPDATE_ERROR: {
        title: 'List Update Error',
        message: 'An error occurred while updating the list',
    },
    CARD_UPDATE_ERROR: {
        title: 'Card Update Error',
        message: 'An error occurred while updating the card',
    },
    CLIPBOARD_COPY_ERROR: {
        title: 'Error copying text',
        message: 'Make sure the browser has this permission enabled',
    },
    CLIPBOARD_PASTE_ERROR: {
        title: 'Error pasting text',
        message: 'Make sure the browser has this permission enabled',
    },
    TEXT_BLOCK_INIT_ERROR: {
        title: 'Error initializing text block',
    },
    TEXT_EVENT_WARN: {
        title: 'Error updating text block',
        color: NoteColor.WARNING,
    },
    ORG_CREATION_ERROR: {
        title: 'Error creating the organization',
    },
    ORG_DATA_ERROR: {
        title: 'Error getting the organization',
    },
    PROJECT_CREATION_ERROR: {
        title: 'Error creating the project',
    },
    PROJECT_DATA_ERROR: {
        title: "There was an error getting the project's data",
    },
    DASH_ERROR: {
        title: 'There was an error loading the dashboard',
    },
    API_ERROR: {
        title: 'API Error',
        message: 'There was an issue with the API server',
    },
    USER_CREATION_ERROR: {
        title: 'Error creating the user',
    },
    UNAUTHORIZED: {
        title: 'Unauthorized',
        message: "You don't have permission to do this!",
    },
    MEMBERSHIP_UPDATE_ERROR: {
        title: 'Membership Update Error',
    },
    CHANGES_SAVED: {
        title: 'Changes Saved',
        color: NoteColor.SUCCESS,
    },
    INVITE_SENT_SUCCESS: {
        title: 'Invitation sent!',
        color: NoteColor.SUCCESS,
    },
    INVITE_RECEIVED: {
        title: 'New Invitation!',
        message: '$ has invited you to join $.',
        timeout: LONG_NOTIFICATION_TIMEOUT,
        color: NoteColor.INFO,
        primary: 'Accept',
        secondary: 'Decline',
    },
    GENERIC_ERROR: {
        title: 'An error occurred!',
        message: 'See console for details',
    },
    NOT_LOGGED_IN: {
        title: 'You must be logged into to do that!',
    },
    INVITE_REVOKED: {
        title: 'Invite to $ revoked',
        color: NoteColor.INFO,
    },
    JOINED_ENTITY: {
        title: 'Welcome to $',
        color: NoteColor.SUCCESS,
    },
    LEFT_ENTITY: {
        title: 'You left $',
        color: NoteColor.INFO,
    },
    ADD_TO_PERSONAL_ORG_ERROR: {
        title: 'Personal Organization',
        message: "You can't invite users to your personal organization",
    },
    ACK_AUTOSAVE: {
        title: 'Autosaved!',
        message: "Don't worry, your changes are automatically saved!",
        color: NoteColor.INFO,
    },
    DOC_CREATION_ERROR: {
        title: 'Error creating the document',
    },
    DOC_UPDATE_ERROR: {
        title: 'Error updating the document',
    },
    DOC_DATA_ERROR: {
        title: 'Error getting the document',
    },
};

/**
 *
 * @param note The NoteType to send
 * @param data Any data to be replaced into the text (Will replace each $ in the text in order of vars)
 */
export const notify = (note: Note, data?: any, actions?: { primary?: () => void; secondary?: () => void }) => {
    if (!note.color || note.color === NoteColor.ERROR) {
        console.error(note.title, note.message, data);
    }
    if (note.color === NoteColor.WARNING) {
        console.warn(note.title, note.message, data);
    }
    try {
        const { title, message } = replaceVars(note, data);
        note.title = title;
        note.message = message;
    } catch (e) {
        console.error(e);
        note = NoteType.GENERIC_ERROR;
    }
    const noteId = crypto.randomUUID();
    const messageBody = (
        <Box>
            <Text c={note.color}>{note.message ?? ''}</Text>
            <Group gap={3}>
                {note.primary && actions?.primary && (
                    <Button
                        size={'compact-sm'}
                        variant="filled"
                        onClick={() => {
                            if (actions.primary) actions.primary();
                            notifications.hide(noteId);
                        }}
                    >
                        {note.primary}
                    </Button>
                )}
                {note.secondary && actions?.secondary && (
                    <Button
                        size={'compact-sm'}
                        variant="outline"
                        onClick={() => {
                            if (actions.secondary) actions.secondary();
                            notifications.hide(noteId);
                        }}
                    >
                        {note.secondary}
                    </Button>
                )}
            </Group>
        </Box>
    );
    notifications.show({
        id: noteId,
        title: note.title,
        message: messageBody,
        color: note.color || NoteColor.ERROR,
        autoClose: note.persist ? false : AUTO_CLOSE_TIMEOUT,
    });
};

const replaceVars = (note: Note, data: any) => {
    const vars: any[] = [];
    if ('number bigint string boolean'.includes(typeof data)) {
        vars.push(data);
    } else if (typeof data === 'object') {
        if (Array.isArray(data)) {
            vars.push(...data);
        } else {
            try {
                vars.push(...Object.keys(data));
            } catch (e) {
                throw new Error('Cant determine data type');
            }
        }
    }

    let varIndex = 0;
    const titleSegments = note.title.split('$');
    if (titleSegments.length - 1 > vars.length) {
        throw new Error('Not enough variables for title');
    }
    let title = '';
    let message: string | undefined = undefined;
    for (let i = 0; i < titleSegments.length; i++) {
        title += titleSegments[i];
        if (i < titleSegments.length - 1) {
            title += vars[varIndex];
            varIndex++;
        }
    }

    if (note.message) {
        const messageSegments = note.message.split('$');
        message = '';
        if (messageSegments.length - 1 > vars.length - varIndex) {
            throw new Error('Not enough variables for message');
        }
        for (let i = 0; i < messageSegments.length; i++) {
            message += messageSegments[i];
            if (i < messageSegments.length - 1) {
                message += vars[varIndex];
                varIndex++;
            }
        }
    }

    return { title, message };
};
