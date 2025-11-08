/**
 * Sets the favicon of the document to the specified URL.
 * @param url The URL of the favicon to set.
 */
export const setFavicon = (url: string) => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        // @ts-expect-error - TypeScript doesn't recognize the 'rel' property on HTMLLinkElement
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    // @ts-expect-error - TypeScript doesn't recognize the 'href' property on HTMLLinkElement
    link.href = url;
};

/**
 * Resets the favicon to the default favicon located at '/favicon.ico'.
 */
export const resetFavicon = () => {
    setFavicon('/favicon.ico');
};

/**
 * Sets the document title to the specified string.
 * @param title The title to set for the document.
 */
export const setTitle = (title: string) => {
    document.title = title;
};
