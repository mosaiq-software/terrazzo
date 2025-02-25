export function arrayMove<T>(array:T[], from:number, to:number): T[] {
    const newArray = array.slice();
    newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
    return newArray;
}

export function updateBaseFromPartial<T>(base:T, partial: Partial<T>): T {
    if (typeof base !== "object"){
        throw new Error("Expected base to be object, received "+(typeof base));
    }
    if(base === null || base === undefined){
        throw new Error("Base cannot be null");
    }
    const mappedBase = {...base}
    const keys = Object.keys(mappedBase);
    for(const k of keys) {
        const partialField = partial[k];
        if (partialField !== undefined) {
            mappedBase[k] = partialField;
        }
    }
    return mappedBase;
}
