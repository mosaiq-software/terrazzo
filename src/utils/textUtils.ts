import {TextBlockEvent} from '../types';

export const executeTextBlockEvent = (textBlock: string, event: TextBlockEvent, selectionStart?: number): {updated:string, selectionStart: number} => {
    let {start, end, inserted} = event;
    if(start > end){ [start, end] = [end, start]; }

    start = Math.max(0, start);
    end = Math.min(end, textBlock.length);

    const updated = textBlock.substring(0, start) + inserted + textBlock.substring(end);
    if (!selectionStart){
        return {updated, selectionStart: 0};
    }

    let newSelStart = 0;
    if (selectionStart < start) {
        // before changed area, leave alone
        newSelStart = selectionStart;
    } else if (selectionStart < end) {
        // inside deleted area, move to where deletion started
        newSelStart = start;
    } else {
        // after deleted area, shift back by deletion then forwards by insertion
        const deleteDelta = end - start;
        newSelStart = (selectionStart - deleteDelta) + inserted.length;
    }

    return {updated, selectionStart:newSelStart}
}

export const isValidTextBlockEvents = (events:TextBlockEvent[]) => {
    for(let event of events){
        if(!(event && 
            event.id && 
            (typeof event.inserted === "string") &&
            (typeof event.end === "number") &&
            (typeof event.start === 'number'))) {
                return false;
            }
    }
    return true;
}