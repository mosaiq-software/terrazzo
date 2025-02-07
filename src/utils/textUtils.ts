import {TextBlockEvent} from '../types';

export const executeTextBlockEvent = (textBlock: string, event: TextBlockEvent) => {
    let {start, end, inserted} = event;
    if(start > end){ [start, end] = [end, start]; }
    return textBlock.substring(0, Math.max(0, start)) + inserted + textBlock.substring(Math.min(end, textBlock.length));
}

export const isValidTextBlockEvent = (event?:TextBlockEvent) => {
    return event && 
        event.id && 
        (typeof event.inserted === "string") &&
        (typeof event.end === "number") &&
        (typeof event.start === 'number');
}