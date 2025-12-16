/**
 * Converts a string to title case: (e.g., "hello world" -> "Hello World")
 */
export const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

/**
 * Converts an array of strings into a human-readable, comma-separated list.
 * Oxford comma is used for lists of three or more items.
 * ```
 * [] => ""
 * ["apple"] => "apple"
 * ["apple", "banana"] => "apple and banana"
 * ["apple", "banana", "cherry"] => "apple, banana, and cherry"
 * ```
 */
export const itemsToCommaSeparatedList = (items: string[]): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};
