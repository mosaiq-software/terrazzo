import { Block } from '@blocknote/core';
import { getInnerTextFromHtml } from '@trz-api/utils/textUtils';
import { BLOCKNOTE_EDITOR } from './blocknote';
import { replaceEncodedMentionsInText, retrieveMentionDisplayText } from './mentions';

/**
 * Converts BlockNote blocks to plaintext, replacing mentions with their display text.
 */
export const convertBlocknoteBlocksToPlaintext = async (blocks: Block[]): Promise<string> => {
    const html = await BLOCKNOTE_EDITOR.blocksToHTMLLossy(blocks);
    const text = getInnerTextFromHtml(html);
    const textWithMentions = await replaceEncodedMentionsInText(text, async (id, type) => {
        return (await retrieveMentionDisplayText(id, type)) || `(${type} ${id})`;
    });
    return textWithMentions;
};

export const getBlocknoteMediaBlock = (mediaUrl: string, mimeType: string, mediaName: string): Block => {
    const isImage = mimeType.startsWith('image/');
    const isVideo = mimeType.startsWith('video/');
    const isAudio = mimeType.startsWith('audio/');
    if (isImage) {
        return getBlocknoteImageBlock(mediaUrl, mediaName);
    } else if (isVideo) {
        return getBlocknoteVideoBlock(mediaUrl, mediaName);
    } else if (isAudio) {
        return getBlocknoteAudioBlock(mediaUrl, mediaName);
    } else {
        return getBlocknoteFileBlock(mediaUrl, mediaName);
    }
};

export const getBlocknoteImageBlock = (imageUrl: string, imageName: string): Block => {
    const imageBlock: Block = {
        id: crypto.randomUUID(),
        type: 'image',
        props: {
            url: imageUrl,
            caption: '',
            previewWidth: 512,
            showPreview: true,
            name: imageName,
            backgroundColor: 'default',
            textAlignment: 'left',
        },
        content: undefined,
        children: [],
    };
    return imageBlock;
};

export const getBlocknoteFileBlock = (fileUrl: string, fileName: string): Block => {
    const fileBlock: Block = {
        id: crypto.randomUUID(),
        type: 'file',
        props: {
            url: fileUrl,
            name: fileName,
            caption: '',
            backgroundColor: 'default',
        },
        content: undefined,
        children: [],
    };
    return fileBlock;
};

export const getBlocknoteVideoBlock = (videoUrl: string, videoName: string): Block => {
    const videoBlock: Block = {
        id: crypto.randomUUID(),
        type: 'video',
        props: {
            url: videoUrl,
            caption: '',
            previewWidth: 512,
            showPreview: true,
            name: videoName,
            backgroundColor: 'default',
            textAlignment: 'left',
        },
        content: undefined,
        children: [],
    };
    return videoBlock;
};

export const getBlocknoteAudioBlock = (audioUrl: string, audioName: string): Block => {
    const audioBlock: Block = {
        id: crypto.randomUUID(),
        type: 'audio',
        props: {
            url: audioUrl,
            caption: '',
            name: audioName,
            showPreview: true,
            backgroundColor: 'default',
        },
        content: undefined,
        children: [],
    };
    return audioBlock;
};

export const getBlocknoteChecklistBlock = (listName: string, items: { text: string; checked: boolean }[]): Block => {
    const checklistItems: Block[] = items.map((item) => ({
        id: crypto.randomUUID(),
        type: 'checkListItem',
        props: {
            checked: item.checked,
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left',
        },
        content: [
            {
                type: 'text',
                text: item.text,
                styles: {},
            },
        ],
        children: [],
    }));
    const checklistBlock: Block = {
        id: crypto.randomUUID(),
        type: 'heading',
        props: {
            level: 3,
            backgroundColor: 'default',
            textColor: 'default',
            textAlignment: 'left',
        },
        content: [
            {
                type: 'text',
                text: listName,
                styles: {},
            },
        ],
        children: checklistItems,
    };
    return checklistBlock;
};

export const maybeParseMarkdownToBlocks = async (markdownText?: string): Promise<Block[]> => {
    try {
        let blocks: Block[] = [];
        try {
            if (markdownText) {
                // @Camo651 - Jan 17th, 2026
                // This line likes to show a TS error but it works at runtime. It only shows it inconsistently...
                // Likely Due to something with having a custom schema defined.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore - Ignored instead of expect-error since this is frustratingly inconsistent
                blocks = await BLOCKNOTE_EDITOR.tryParseMarkdownToBlocks(markdownText);
            }
        } catch (e: any) {
            console.error('Failed to parse markdown', {
                error: e,
                markdownText,
            });
            blocks = [];
        }

        //default to blocknote's hardcoded block with the text if for some reason its not valid markdown
        if (!blocks.length && markdownText?.length) {
            blocks = [
                {
                    id: 'initialBlockId',
                    type: 'paragraph',
                    props: {
                        backgroundColor: 'default',
                        textColor: 'default',
                        textAlignment: 'left',
                    },
                    content: [
                        {
                            type: 'text',
                            text: markdownText,
                            styles: {},
                        },
                    ],
                    children: [],
                },
                {
                    id: crypto.randomUUID(),
                    type: 'paragraph',
                    props: {
                        backgroundColor: 'default',
                        textColor: 'default',
                        textAlignment: 'left',
                    },
                    content: [],
                    children: [],
                },
            ];
        }
        return blocks;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return [];
    }
};
