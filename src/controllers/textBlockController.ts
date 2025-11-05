import { TextBlockId } from '@mosaiq/terrazzo-common/types';
import { createTextBlock, getTextBlockById, writeTextBlock } from '@trz-api/persistence/textBlockPersistence';
import * as Y from 'yjs';

export const storeTextBlockEncodedData = async (_textBlockId: TextBlockId, data: string) => {
    let textBlockId = (await getTextBlockById(_textBlockId))?.id;
    if (!textBlockId) {
        textBlockId = (await createTextBlock(data)).id;
    }
    if (!textBlockId) {
        throw new Error(`Unable to find or create text block ${_textBlockId}`);
    }

    try {
        await writeTextBlock(textBlockId, data);
    } catch (error: any) {
        console.error('Unable to save text block ' + textBlockId + ' : ' + error.message);
        throw new Error('Unable to save text block ' + textBlockId + ' : ' + error.message);
    }
};

export const loadTextBlockEncodedData = async (textBlockId: TextBlockId) => {
    try {
        const textBlock = await getTextBlockById(textBlockId);
        if (!textBlock) {
            throw new Error(`Text block ${textBlockId} not found`);
        }
        const text = textBlock.text;
        if (isValidBase64(text)) {
            return text;
        }
        return plaintextToRemirrorYjs(text);
    } catch (error: any) {
        console.error(`Unable to load text block ${textBlockId} : ${error.message}`);
        return null;
    }
};

export const createTextBlockWithPlaintext = async (plaintext?: string) => {
    const encoded = plaintextToRemirrorYjs(plaintext ?? '');
    return await createTextBlockWithEncodedData(encoded);
};

export const createTextBlockWithEncodedData = async (data: string) => {
    try {
        const uid = await createTextBlock(data);
        return uid;
    } catch (e: any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
};

/**
 * Converts plain text to a Y.js document that can be saved as base64 string
 * Creates a Remirror-compatible ProseMirror document structure in Y.js format
 * @param text The plain text to convert
 * @returns Base64 encoded Y.js document state
 */
export const plaintextToRemirrorYjs = (text: string): string => {
    const ydoc = new Y.Doc();

    // Based on inspection, we need to create the shared types that Remirror expects
    // The rawSharedTypes shows both 'prosemirror' and 'default' exist as AbstractType
    // Let's try different approaches to see what works

    // Approach 1: Create as XmlFragment (most common for ProseMirror)
    const prosemirrorDoc = ydoc.getXmlFragment('prosemirror');

    if (text) {
        // Create a simple paragraph structure that ProseMirror expects
        const paragraph = new Y.XmlElement('paragraph');
        const textNode = new Y.XmlText();
        textNode.insert(0, text);
        paragraph.insert(0, [textNode]);
        prosemirrorDoc.insert(0, [paragraph]);
    } else {
        // Empty document should still have a paragraph
        const paragraph = new Y.XmlElement('paragraph');
        prosemirrorDoc.insert(0, [paragraph]);
    }

    const update = Y.encodeStateAsUpdate(ydoc);
    const base64String = Buffer.from(update).toString('base64');
    return base64String;
};

export const remirrorYjsToPlaintext = (base64Data: string): string => {
    const binaryData = Buffer.from(base64Data, 'base64');
    const ydoc = new Y.Doc();
    Y.applyUpdate(ydoc, binaryData);
    const prosemirrorDoc = ydoc.getXmlFragment('prosemirror');

    let plaintext = '';
    prosemirrorDoc.forEach((node) => {
        plaintext += node.toString();
    });

    // clean up the plaintext by removing XML tags
    plaintext = plaintext.replace(/<\/?[^>]+(>|$)/g, ' ').trim();
    plaintext = plaintext.replace(/\s+/g, ' ');

    return plaintext;
};

/**
 * Validates if a string is a valid base64 encoded string
 * @param str The string to validate
 * @returns true if the string is valid base64, false otherwise
 */
export const isValidBase64 = (str: string): boolean => {
    if (!str || typeof str !== 'string') {
        return false;
    }
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(str)) {
        return false;
    }
    if (str.length % 4 !== 0) {
        return false;
    }

    try {
        Buffer.from(str, 'base64');
        const decoded = Buffer.from(str, 'base64');
        const reencoded = decoded.toString('base64');
        return reencoded === str;
    } catch (error) {
        return false;
    }
};
