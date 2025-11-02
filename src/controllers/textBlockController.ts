import { TextBlockId } from "@mosaiq/terrazzo-common/types";
import { getTextBlockById, writeTextBlock } from "@trz-api/persistence/textBlockPersistence";


export const storeTextBlockData = async (textBlockId:TextBlockId, data: string) => {
    const textBlock = await getTextBlockById(textBlockId);
    if(!textBlock){
        throw new Error("Text block not found");
    }

    try {
        await writeTextBlock(textBlockId, data);
    } catch (error: any) {
        console.error("Unable to save text block " + textBlockId + " : "+error.message);
        throw new Error("Unable to save text block " + textBlockId + " : "+error.message);
    }
}

export const loadTextBlockData = async (textBlockId:TextBlockId) => {
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