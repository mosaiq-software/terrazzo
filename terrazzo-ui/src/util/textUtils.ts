/**
 * Converts a string to title case: (e.g., "hello world" -> "Hello World")
 */
export const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
