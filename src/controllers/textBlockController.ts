import { TextBlockId } from "@mosaiq/terrazzo-common/types";
import { createTextBlock, getTextBlockById, writeTextBlock } from "@trz-api/persistence/textBlockPersistence";
import * as Y from 'yjs';


export const storeTextBlockEncodedData = async (_textBlockId:TextBlockId, data: string) => {
    let textBlockId = (await getTextBlockById(_textBlockId))?.id;
    if(!textBlockId){
        textBlockId = (await createTextBlock(data)).id;
    }
    if(!textBlockId){
        throw new Error(`Unable to find or create text block ${_textBlockId}`);
    }

    try {
        await writeTextBlock(textBlockId, data);
    } catch (error: any) {
        console.error("Unable to save text block " + textBlockId + " : "+error.message);
        throw new Error("Unable to save text block " + textBlockId + " : "+error.message);
    }
}

export const loadTextBlockEncodedData = async (textBlockId:TextBlockId) => {
    try {
        const textBlock = await getTextBlockById(textBlockId);
        if(!textBlock){
            throw new Error(`Text block ${textBlockId} not found`);
        }
        return textBlock.text;
    } catch (error: any) {
        console.error(`Unable to load text block ${textBlockId} : ${error.message}`);
        return null;
    }
}

export const createTextBlockWithPlaintext = async (plaintext?:string) => {
    try {
        const encoded = plaintextToRemirrorYjs(plaintext ?? '');
        const uid = await createTextBlock(encoded);
        return uid;
    } catch (e:any) {
        console.error(`Unable to create text block`, e);
        return null;
    }
}

/**
 * Converts plain text to a Y.js document that can be saved as base64 string
 * Creates a Remirror-compatible ProseMirror document structure in Y.js format
 * @param text The plain text to convert
 * @returns Base64 encoded Y.js document state
 */
export const plaintextToRemirrorYjs = (text: string): string => {
    // Create a new Y.js document
    const ydoc = new Y.Doc();
    
    // Get the shared type for the document - Remirror uses 'default' as the key for the main document
    const yXmlFragment = ydoc.getXmlFragment('default');
    
    if (text.trim()) {
        // Split text by newlines to create paragraph elements
        const lines = text.split('\n');
        
        lines.forEach((line, index) => {
            // Create a paragraph element for each line
            const paragraph = new Y.XmlElement('paragraph');
            
            if (line.trim()) {
                // If line has content, add it as a text node
                const textNode = new Y.XmlText();
                textNode.insert(0, line);
                paragraph.insert(0, [textNode]);
            } else {
                // Empty paragraph for empty lines
                const textNode = new Y.XmlText();
                paragraph.insert(0, [textNode]);
            }
            
            yXmlFragment.insert(index, [paragraph]);
        });
    } else {
        // If no text, create a single empty paragraph
        const paragraph = new Y.XmlElement('paragraph');
        const textNode = new Y.XmlText();
        paragraph.insert(0, [textNode]);
        yXmlFragment.insert(0, [paragraph]);
    }
    
    // Encode the document state as an update and convert to base64
    const update = Y.encodeStateAsUpdate(ydoc);
    const base64String = Buffer.from(update).toString('base64');
    
    return base64String;
}