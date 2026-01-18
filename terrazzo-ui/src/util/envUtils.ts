export const isDev = () => {
    const isProd = import.meta.env.PRODUCTION;
    if (isProd === 'true' || isProd === true) {
        return false;
    }
    return true;
};

/**
 * Detect if the user is on a mobile device based on the screen width.
 */
export const isMobile = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.innerWidth <= 768;
};

export const isDesktop = () => {
    return !isMobile();
};
