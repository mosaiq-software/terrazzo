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

export const replaceFirstOccurrence = (text: string, searchValue: string, replacement: string): string => {
    const index = text.indexOf(searchValue);
    if (index === -1) {
        return text;
    }
    return `${text.slice(0, index)}${replacement}${text.slice(index + searchValue.length)}`;
};
