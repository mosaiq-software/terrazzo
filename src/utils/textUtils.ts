import {TextBlockEvent, UserHeader} from '../types';

export const executeTextBlockEvent = (textBlock: string, event: TextBlockEvent, selectionStart?: number): {updated:string, selectionStart: number} => {
    let {start, end} = event;
    const {inserted} = event;
    if(start > end){ [start, end] = [end, start]; }

    start = Math.max(0, start);
    end = Math.min(end, textBlock.length);

    const updated = textBlock.substring(0, start) + inserted + textBlock.substring(end);
    if (selectionStart === undefined){
        return {updated, selectionStart: 0};
    }

    let newSelStart = 0;
    const deleteDelta = end - start;
    if (selectionStart < start) {
        // before changed area, leave alone
        newSelStart = selectionStart;
    } else if (selectionStart < end) {
        // inside deleted area, move to where deletion started
        newSelStart = start + inserted.length;
    } else {
        // after deleted area, shift back by deletion then forwards by insertion
        newSelStart = (selectionStart - deleteDelta) + inserted.length;
    }

    return {updated, selectionStart:newSelStart}
}

export const isValidTextBlockEvents = (events:TextBlockEvent[]) => {
    for(const event of events){
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

export const fullName = (user: UserHeader | undefined | null) => {
    if(!user){
        return 'User';
    }
    if(!user.firstName && !user.lastName){
        return user.username;
    }
    return `${user.firstName} ${user.lastName}`;
}