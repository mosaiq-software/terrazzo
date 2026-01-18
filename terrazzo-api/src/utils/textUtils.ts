/**
 * Given a markdown text, extracts all image URLs from it.
 * Images are in markdown format: ![alt text](image_url)
 */
export const extractMarkdownImagesFromText = (text: string): string[] => {
    const imageUrls: string[] = [];
    const markdownImageRegex = /!\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = markdownImageRegex.exec(text)) !== null) {
        imageUrls.push(match[1]);
    }
    return imageUrls;
};

/**
 * Replaces the first occurrence of searchValue in text with replacement.
 * If searchValue is not found, returns the original text.
 */
export const replaceFirstOccurrence = (text: string, searchValue: string, replacement: string): string => {
    const index = text.indexOf(searchValue);
    if (index === -1) {
        return text;
    }
    return `${text.slice(0, index)}${replacement}${text.slice(index + searchValue.length)}`;
};

/**
 * Replaces all occurrences of searchValue in text with replacement.
 * If searchValue is not found, returns the original text.
 */
export const replaceAllOccurrences = (text: string, searchValue: string, replacement: string): string => {
    return text.split(searchValue).join(replacement);
};

/**
 * Extracts and returns the inner text from the provided HTML string, stripping out all HTML tags.
 * Handles block-level tags by replacing them with newlines to preserve text structure.
 * @param html The HTML string to extract text from
 * @returns The extracted inner text
 */
export const getInnerTextFromHtml = (html: string): string => {
    const blockLevelTags = ['div', 'p', 'br', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'];
    let text = html;
    for (const tag of blockLevelTags) {
        const regexOpen = new RegExp(`<${tag}[^>]*>`, 'gi');
        const regexClose = new RegExp(`</${tag}>`, 'gi');
        text = text.replace(regexOpen, '\n').replace(regexClose, '\n');
    }
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/\n+/g, '\n').trim();
    return text;
};
