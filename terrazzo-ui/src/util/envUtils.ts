export const isDev = () => {
    const isProd = import.meta.env.PRODUCTION;
    if (isProd === 'true' || isProd === true) {
        return false;
    }
    return true;
};
