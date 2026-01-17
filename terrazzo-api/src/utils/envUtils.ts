export const isDev = () => {
    const isProd = process.env.PRODUCTION;
    if (isProd === 'true') {
        return false;
    }
    return true;
};

export const getApiUrl = () => {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
        throw new Error('API_URL is not defined in environment variables');
    }
    return apiUrl;
};
