import { TextBlockEvent } from "@mosaiq/terrazzo-common/types"
import { executeTextBlockEvent } from "@mosaiq/terrazzo-common/utils/textUtils";
import { getTextBlockById, writeTextBlock } from "@trz-api/persistence/textBlockPersistence";


export const handleTextBlockEvent = async (event: TextBlockEvent) => {
    const textBlock = await getTextBlockById(event.id);
    if(!textBlock){
        throw new Error("Text block not found");
    }
    const {updated} = executeTextBlockEvent(textBlock.text, event);
    try {
        await writeTextBlock(event.id, updated);
    } catch (error: any) {
        console.error("Unable to save text block " + event.id + " : "+error.message);
        throw error;
    }
}