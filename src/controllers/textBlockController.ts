import { TextBlockEvent } from "@mosaiq/terrazzo-common/types"
import { executeTextBlockEvent } from "@mosaiq/terrazzo-common/utils/textUtils";
import { getTextBlockById, writeTextBlock } from "@trz-api/persistence/textBlockPersistence";


export const handleTextBlockEvents = async (events: TextBlockEvent[]) => {
    if(!events || events.length === 0){
        return undefined;
    }

    const textBlock = await getTextBlockById(events[0].id);
    if(!textBlock){
        throw new Error("Text block not found");
    }

    let text = textBlock.text;

    for (const event of events){
        if(event.id !== events[0].id){
            throw new Error("Mismatched IDs "+event.id+" != "+events[0].id);
        }
        const {updated} = executeTextBlockEvent(text, event);
        text = updated;
    }

    try {
        await writeTextBlock(events[0].id, text);
        return text;
    } catch (error: any) {
        console.error("Unable to save text block " + events[0].id + " : "+error.message);
        throw new Error("Unable to save text block " + events[0].id + " : "+error.message);
    }
}