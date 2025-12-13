export const isDev = () => {
    const isProd = process.env.PRODUCTION;
    if (isProd === 'true') {
        return false;
    }
    return true;
};
