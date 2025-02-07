import { TextBlockEvent } from "@mosaiq/terrazzo-common/types"
import { getTextBlockById } from "@trz-api/persistence/textBlockPersistence";


export const handleTextBlockEvent = async (event: TextBlockEvent) => {
    let {id, start, end, inserted} = event;
    
    // Get the text block
    const textBlock = await getTextBlockById(id);
    if(!textBlock){
        throw new Error("Text block not found")
    }

    // Clean start and end positions
    if(start > end){
        [start, end] = [end, start];
    }
    start = Math.max(0, start);
    end = Math.min(end, textBlock.text.length);
    console.log("start:",start,"end:",end);
    console.log(textBlock.text.substring(0, start));
    console.log(inserted);
    console.log(textBlock.text.substring(end));
    const newText = textBlock.text.substring(0, start) + inserted + textBlock.text.substring(end);
    console.log(newText);
}