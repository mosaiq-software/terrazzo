export function updateBaseFromPartial<T>(base:T, partial: Partial<T>): T {
    if (typeof base !== "object"){
        throw new Error("Expected base to be object, received "+(typeof base));
    }
    if(base === null || base === undefined){
        throw new Error("Base cannot be null");
    }
    const mappedBase = {...base}
    const keys = Object.keys(mappedBase);
    for(let k in keys) {
        const partialField = partial[k];
        if (partialField !== undefined) {
            mappedBase[k] = partialField;
        }
    }
    return mappedBase;
}